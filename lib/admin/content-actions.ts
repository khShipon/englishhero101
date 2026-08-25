"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { getDescendants, isSlugTaken } from "@/lib/queries/content";
import { contentNodeSchema } from "@/lib/admin/validation";

// Matches the cacheTag() calls in lib/queries/content.ts's public-site
// functions — busts the public site's cached category tree/nav/pages
// immediately on any change here (see "use cache" + updateTag docs).
const CONTENT_TAG = "content-nodes";

export type ContentFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeContentNodeError(error: PostgrestError): string {
  if (error.code === "23505") {
    return "That slug is already used by a sibling node. Choose a different slug.";
  }
  if (error.code === "23503") {
    return "The selected parent no longer exists. Please choose another.";
  }
  return "Could not save this content node. Please try again.";
}

function parseNodeForm(formData: FormData) {
  return contentNodeSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    nodeType: formData.get("nodeType"),
    parentId: formData.get("parentId") ?? "",
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    isPublished: formData.get("isPublished"),
    isFeatured: formData.get("isFeatured"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export async function createContentNode(
  _state: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseNodeForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();

  const siblingQuery = supabase
    .from("content_nodes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const { data: lastSibling } = parsed.data.parentId
    ? await siblingQuery.eq("parent_id", parsed.data.parentId)
    : await siblingQuery.is("parent_id", null);
  const sortOrder = (lastSibling?.[0]?.sort_order ?? -1) + 1;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("content_nodes").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    node_type: parsed.data.nodeType,
    parent_id: parsed.data.parentId,
    icon: parsed.data.icon,
    cover_image_url: parsed.data.coverImageUrl,
    sort_order: sortOrder,
    is_published: parsed.data.isPublished,
    is_featured: parsed.data.isFeatured,
    seo_title: parsed.data.seoTitle,
    seo_description: parsed.data.seoDescription,
    created_by: user?.id ?? null,
    published_at: parsed.data.isPublished ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: humanizeContentNodeError(error) };
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
  redirect("/admin/content");
}

export async function updateContentNode(
  _state: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing content node id." };
  }

  const parsed = parseNodeForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  if (parsed.data.parentId) {
    if (parsed.data.parentId === id) {
      return { error: "A node cannot be its own parent." };
    }
    const descendants = await getDescendants(id);
    if (descendants.some((descendant) => descendant.id === parsed.data.parentId)) {
      return { error: "Cannot move a node into one of its own descendants." };
    }
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("content_nodes")
    .select("is_published, published_at")
    .eq("id", id)
    .single();

  const publishedAt =
    parsed.data.isPublished && !existing?.is_published
      ? new Date().toISOString()
      : (existing?.published_at ?? null);

  const { error } = await supabase
    .from("content_nodes")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      node_type: parsed.data.nodeType,
      parent_id: parsed.data.parentId,
      icon: parsed.data.icon,
      cover_image_url: parsed.data.coverImageUrl,
      is_published: parsed.data.isPublished,
      is_featured: parsed.data.isFeatured,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      published_at: parsed.data.isPublished ? publishedAt : null,
    })
    .eq("id", id);

  if (error) {
    return { error: humanizeContentNodeError(error) };
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
  redirect("/admin/content");
}

export async function deleteContentNode(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("content_nodes").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this content node.");
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
}

export async function togglePublish(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const nextPublished = formData.get("nextPublished") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_nodes")
    .update({
      is_published: nextPublished,
      published_at: nextPublished ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Could not update the publish state.");
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
}

// Duplicates only the node itself (title/description/metadata), not
// its children — a quick way to start a variant of one category or
// topic. Always created as a draft so a copy is never accidentally
// public before it's reviewed.
export async function duplicateContentNode(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("content_nodes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    throw new Error("Could not find the content node to duplicate.");
  }

  const baseSlug = `${original.slug}-copy`;
  let slug = baseSlug;
  let attempt = 1;
  while (await isSlugTaken(original.parent_id, slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("content_nodes").insert({
    parent_id: original.parent_id,
    title: `${original.title} (Copy)`,
    slug,
    description: original.description,
    node_type: original.node_type,
    icon: original.icon,
    cover_image_url: original.cover_image_url,
    sort_order: original.sort_order + 1,
    is_published: false,
    is_featured: false,
    seo_title: original.seo_title,
    seo_description: original.seo_description,
    created_by: user?.id ?? null,
  });

  if (error) {
    throw new Error("Could not duplicate this content node.");
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
}

export async function moveNode(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();
  const { data: node, error: nodeError } = await supabase
    .from("content_nodes")
    .select("id, parent_id, sort_order")
    .eq("id", id)
    .single();

  if (nodeError || !node) {
    throw new Error("Content node not found.");
  }

  const base = supabase.from("content_nodes").select("id, sort_order").neq("id", id);
  const scoped = node.parent_id ? base.eq("parent_id", node.parent_id) : base.is("parent_id", null);

  const { data: sibling } =
    direction === "up"
      ? await scoped
          .lt("sort_order", node.sort_order)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await scoped
          .gt("sort_order", node.sort_order)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

  if (!sibling) return;

  const [{ error: err1 }, { error: err2 }] = await Promise.all([
    supabase.from("content_nodes").update({ sort_order: sibling.sort_order }).eq("id", node.id),
    supabase.from("content_nodes").update({ sort_order: node.sort_order }).eq("id", sibling.id),
  ]);

  if (err1 || err2) {
    throw new Error("Could not reorder content nodes.");
  }

  revalidatePath("/admin/content");
  updateTag(CONTENT_TAG);
}

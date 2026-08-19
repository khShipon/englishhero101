"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ContentTreeNode } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteNodeDialog } from "@/components/admin/delete-node-dialog";
import { togglePublish, duplicateContentNode, moveNode } from "@/lib/admin/content-actions";
import {
  ChevronRight,
  Pencil,
  Plus,
  MoreHorizontal,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  BookText,
} from "lucide-react";
import { cn } from "@/lib/utils";

function filterTree(nodes: ContentTreeNode[], query: string): ContentTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const filter = (list: ContentTreeNode[]): ContentTreeNode[] =>
    list.reduce<ContentTreeNode[]>((acc, node) => {
      const children = filter(node.children);
      const selfMatches =
        node.title.toLowerCase().includes(q) || node.nodeType.toLowerCase().includes(q);
      if (selfMatches || children.length > 0) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);

  return filter(nodes);
}

function collectIds(nodes: ContentTreeNode[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectIds(node.children)]);
}

function countDescendants(node: ContentTreeNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

export function ContentTree({ nodes }: { nodes: ContentTreeNode[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => filterTree(nodes, query), [nodes, query]);
  const effectiveExpanded = query.trim() ? new Set(collectIds(filtered)) : expanded;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search content..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        <Link
          href="/admin/content/new"
          className={cn(buttonVariants({ variant: "default" }), "sm:w-fit")}
        >
          <Plus /> New top-level category
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {query ? "No content matches your search." : "No content yet. Create your first category."}
        </p>
      ) : (
        <div className="rounded-lg border">
          {filtered.map((node) => (
            <ContentTreeRow
              key={node.id}
              node={node}
              depth={0}
              expanded={effectiveExpanded}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentTreeRow({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: ContentTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 overflow-x-auto border-b px-3 py-2 last:border-b-0 hover:bg-muted/50"
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {hasChildren && (
            <ChevronRight className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
          )}
        </button>

        <span className="min-w-0 flex-1 truncate text-sm font-medium">{node.title}</span>
        <Badge variant="outline">{node.nodeType}</Badge>
        <Badge variant={node.isPublished ? "default" : "secondary"}>
          {node.isPublished ? "Published" : "Draft"}
        </Badge>

        <div className="flex shrink-0 items-center gap-0.5">
          <form action={moveNode}>
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="direction" value="up" />
            <Button variant="ghost" size="icon-sm" type="submit" aria-label="Move up">
              <ArrowUp />
            </Button>
          </form>
          <form action={moveNode}>
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="direction" value="down" />
            <Button variant="ghost" size="icon-sm" type="submit" aria-label="Move down">
              <ArrowDown />
            </Button>
          </form>
          <form action={togglePublish}>
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="nextPublished" value={(!node.isPublished).toString()} />
            <Button
              variant="ghost"
              size="icon-sm"
              type="submit"
              aria-label={node.isPublished ? "Unpublish" : "Publish"}
            >
              {node.isPublished ? <EyeOff /> : <Eye />}
            </Button>
          </form>
          <Link
            href={`/admin/content/new?parent=${node.id}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Add child"
          >
            <Plus />
          </Link>
          <Link
            href={`/admin/content/${node.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Edit"
          >
            <Pencil />
          </Link>
          <Link
            href={`/admin/content/${node.id}/lessons`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Lessons"
          >
            <BookText />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="More actions"
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <form action={duplicateContentNode}>
                <input type="hidden" name="id" value={node.id} />
                <button
                  type="submit"
                  className="flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
                >
                  <Copy /> Duplicate
                </button>
              </form>
              <DeleteNodeDialog
                nodeId={node.id}
                title={node.title}
                descendantCount={countDescendants(node)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <ContentTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

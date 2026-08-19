import type { MetadataRoute } from "next";
import { getSitemapPaths } from "@/lib/queries/sitemap";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { nodePaths, lessonPaths } = await getSitemapPaths();

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vocabulary`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...nodePaths.map((entry) => ({
      url: `${SITE_URL}${entry.url}`,
      lastModified: new Date(entry.lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...lessonPaths.map((entry) => ({
      url: `${SITE_URL}${entry.url}`,
      lastModified: new Date(entry.lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

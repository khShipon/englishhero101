import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/profile",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/auth/",
        "/unauthorized",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

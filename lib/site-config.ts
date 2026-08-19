// sitemap.ts, robots.ts, and root metadata don't run per-request, so
// they can't derive the origin from request headers the way the auth
// flows do — they need a fixed absolute URL instead.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://englishhero101.vercel.app").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "EnglishHero101";

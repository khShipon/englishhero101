import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets published content (lessons, vocabulary, question banks) be
  // cached and served from a static shell instead of hitting Supabase
  // on every request — see lib/supabase/public.ts for the client used
  // by the cached query functions this depends on.
  cacheComponents: true,
};

export default nextConfig;

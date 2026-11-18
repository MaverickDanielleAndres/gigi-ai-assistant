import type { MetadataRoute } from "next";
import { siteUrl } from "@/server/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).href, changeFrequency: "monthly", priority: 1 },
    { url: new URL("/app", base).href, changeFrequency: "monthly", priority: 0.7 },
  ];
}

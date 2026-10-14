import type { MetadataRoute } from "next";
import { lessons } from "@/data/lessons";
import { grammarTopics } from "@/data/grammar";
import { blogPosts } from "@/data/blog";

const BASE = "https://deutschbangla-cards.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/lektionen`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/wortschatz`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/grammatik`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/quiz`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/resources`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/opportunities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/fortschritt`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const lessonUrls: MetadataRoute.Sitemap = lessons.map((l) => ({
    url: `${BASE}/lektionen/${l.id}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const grammarUrls: MetadataRoute.Sitemap = grammarTopics.map((t) => ({
    url: `${BASE}/grammatik/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...lessonUrls, ...grammarUrls, ...blogUrls];
}

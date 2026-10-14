import { notFound } from "next/navigation";
import { blogPosts, getPost } from "@/data/blog";
import BlogPostClient from "./BlogPostClient";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const idx = blogPosts.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? blogPosts[idx - 1] : null;
  const next = idx < blogPosts.length - 1 ? blogPosts[idx + 1] : null;

  return <BlogPostClient post={post} prev={prev} next={next} />;
}

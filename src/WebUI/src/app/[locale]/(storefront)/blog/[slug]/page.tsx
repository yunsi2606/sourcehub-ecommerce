"use client";

import { useEffect, useState, use } from "react";
import { Link } from "@/i18n/routing";
import { blogApi } from "@/lib/api/blog";
import { PostDetailDto } from "@/types/api";
import { Calendar, Clock, ArrowLeft, User, Eye, Tag } from "lucide-react";
import { JsonRenderer } from "@/components/blog/JsonRenderer";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getBySlug(slug)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-12"></div>
        <div className="aspect-video bg-slate-200 rounded-3xl mb-12"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Không tìm thấy bài viết</h1>
        <p className="text-slate-500 mb-8">Bài viết này có thể đã bị xoá hoặc đường dẫn không chính xác.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors">
          <ArrowLeft className="w-5 h-5" /> Về trang Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-24 bg-white">
      {/* Hero Section */}
      <div className="bg-slate-50 border-b border-slate-200 py-12 md:py-20 mb-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Quay lại Blog
          </Link>
          
          {post.categoryName && (
            <div className="mb-6">
              <Link href={`/blog?category=${post.blogCategoryId}`} className="inline-flex px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold tracking-wide uppercase hover:bg-indigo-200 transition-colors">
                {post.categoryName}
              </Link>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                {post.authorAvatarUrl ? (
                  <img src={post.authorAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className="font-semibold text-slate-900">{post.authorName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : "Bản nháp"}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              {post.readTimeMinutes} phút đọc
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              {post.viewCount} lượt xem
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Excerpt Lead */}
        {post.excerpt && (
          <div className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium mb-12 italic border-l-4 border-primary pl-6">
            {post.excerpt}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-2xl prose-img:shadow-sm">
          <JsonRenderer contentJson={post.contentJson} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap gap-2">
            <Tag className="w-5 h-5 text-slate-400 mr-2 mt-0.5" />
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

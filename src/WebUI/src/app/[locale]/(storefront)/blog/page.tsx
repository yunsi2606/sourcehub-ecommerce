"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { blogApi } from "@/lib/api/blog";
import { BlogCategoryDto, PostSummaryDto } from "@/types/api";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

export default function BlogIndexPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [posts, setPosts] = useState<PostSummaryDto[]>([]);
  const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    blogApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch posts based on category filter
    setLoading(true);
    blogApi.getList({ 
      blogCategoryId: categoryId || undefined,
      pageSize: 12
    })
      .then(res => setPosts(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">SourceHub Blog</h1>
          <p className="text-lg text-slate-600">
            Kiến thức lập trình, xu hướng công nghệ và chia sẻ kinh nghiệm phát triển phần mềm.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content: Post Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 aspect-[16/9] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-lg">Chưa có bài viết nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map(post => (
                <article key={post.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-slate-100 relative">
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    {post.categoryName && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {post.categoryName}
                      </span>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "—"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTimeMinutes} phút đọc
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                      <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {post.authorAvatarUrl ? (
                            <img src={post.authorAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{post.authorName}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="text-primary text-sm font-medium flex items-center gap-1 group/btn">
                        Đọc tiếp <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Categories */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/blog"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    !categoryId ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả bài viết</span>
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link 
                    href={`/blog?category=${cat.id}`}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${
                      categoryId === cat.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="bg-slate-100 text-slate-500 text-xs py-0.5 px-2 rounded-full font-medium">
                      {cat.postCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Just a fallback icon if no image
const ImageIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

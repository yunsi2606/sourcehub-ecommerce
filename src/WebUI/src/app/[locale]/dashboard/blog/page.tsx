"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/stores/authStore";
import { adminBlogApi } from "@/lib/api/blog";
import { PostSummaryDto } from "@/types/api";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function BlogAdminPage() {
  const t = useTranslations("Dashboard");
  const { accessToken } = useAuthStore();
  const [posts, setPosts] = useState<PostSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await adminBlogApi.getList(accessToken, { pageSize: 50 });
      setPosts(res.items);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá/lưu trữ bài viết này?")) return;
    try {
      await adminBlogApi.delete(accessToken!, id);
      toast.success("Đã xoá bài viết");
      fetchPosts();
    } catch (err) {
      toast.error("Xoá bài viết thất bại");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Blog</h1>
          <p className="text-slate-500 mt-1">Viết và quản lý các bài đăng trên blog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog/categories"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Danh mục
          </Link>
          <Link
            href="/dashboard/blog/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Viết bài mới
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200">Bài viết</th>
              <th className="px-4 py-3 border-b border-slate-200">Trạng thái</th>
              <th className="px-4 py-3 border-b border-slate-200">Lượt xem</th>
              <th className="px-4 py-3 border-b border-slate-200">Ngày xuất bản</th>
              <th className="px-4 py-3 border-b border-slate-200 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-10"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-4 py-4"></td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Chưa có bài viết nào.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{post.categoryName || "Chưa phân loại"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${post.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                        post.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{post.viewCount}</td>
                  <td className="px-4 py-4">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Xem bài viết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/blog/${post.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

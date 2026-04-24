"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/stores/authStore";
import { adminBlogApi, blogApi } from "@/lib/api/blog";
import { BlogCategoryDto } from "@/types/api";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function BlogCategoriesPage() {
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getCategories();
      setCategories(res);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Tên danh mục mới:");
    if (!name) return;
    try {
      await adminBlogApi.createCategory(accessToken!, { name, description: "" });
      toast.success("Tạo danh mục thành công");
      fetchCategories();
    } catch (err) {
      toast.error("Tạo danh mục thất bại");
    }
  };

  const handleEdit = async (cat: BlogCategoryDto) => {
    const name = prompt("Tên danh mục mới:", cat.name);
    if (!name || name === cat.name) return;
    try {
      await adminBlogApi.updateCategory(accessToken!, cat.id, { name, description: cat.description });
      toast.success("Cập nhật danh mục thành công");
      fetchCategories();
    } catch (err) {
      toast.error("Cập nhật danh mục thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá danh mục này? Các bài viết trong danh mục sẽ trở thành chưa phân loại.")) return;
    try {
      await adminBlogApi.deleteCategory(accessToken!, id);
      toast.success("Đã xoá danh mục");
      fetchCategories();
    } catch (err) {
      toast.error("Xoá danh mục thất bại");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/dashboard/blog" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Quay lại Blog
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục Blog</h1>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200">Tên danh mục</th>
              <th className="px-4 py-3 border-b border-slate-200">Slug</th>
              <th className="px-4 py-3 border-b border-slate-200 text-center">Số bài viết</th>
              <th className="px-4 py-3 border-b border-slate-200 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center">Đang tải...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center">Chưa có danh mục nào.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900">{cat.name}</td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {cat.postCount}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600">
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

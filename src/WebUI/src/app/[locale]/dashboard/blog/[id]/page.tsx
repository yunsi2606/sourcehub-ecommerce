"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/authStore";
import { adminBlogApi, blogApi } from "@/lib/api/blog";
import { fileApi } from "@/lib/api/files";
import { BlogCategoryDto, CreatePostRequest, PostDetailDto } from "@/types/api";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/dashboard/blog/TiptapEditor";
import Link from "next/link";

export default function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CreatePostRequest>({
    title: "",
    excerpt: "",
    contentJson: "{}",
    coverImageUrl: null,
    blogCategoryId: null,
    tagIds: [],
    status: "Draft",
    isFeatured: false,
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    blogApi.getCategories().then(setCategories).catch(console.error);

    if (!isNew && accessToken) {
      adminBlogApi.getById(accessToken, id)
        .then((post) => {
          setFormData({
            title: post.title,
            excerpt: post.excerpt,
            contentJson: post.contentJson || "{}",
            coverImageUrl: post.coverImageUrl,
            blogCategoryId: post.blogCategoryId,
            tagIds: [], // Tags are strings in post.tags, need mapping if used, leaving empty for simplicity
            status: post.status,
            isFeatured: post.isFeatured,
          });
          setCoverPreview(post.coverImageUrl);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Không tìm thấy bài viết");
          router.push("/dashboard/blog");
        });
    }
  }, [id, isNew, accessToken, router]);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      toast.loading("Đang tải ảnh lên...", { id: "upload-cover" });
      const res = await fileApi.uploadTemp(file, accessToken);
      setFormData(prev => ({ ...prev, coverImageUrl: res.url }));
      setCoverPreview(res.fullUrl);
      toast.success("Tải ảnh thành công", { id: "upload-cover" });
    } catch (err) {
      toast.error("Tải ảnh thất bại", { id: "upload-cover" });
    }
  };

  const handleSave = async () => {
    if (!formData.title) return toast.error("Vui lòng nhập tiêu đề");
    if (!accessToken) return;

    try {
      setSaving(true);
      if (isNew) {
        await adminBlogApi.create(accessToken, formData);
        toast.success("Tạo bài viết thành công");
        router.push("/dashboard/blog");
      } else {
        await adminBlogApi.update(accessToken, id, formData);
        toast.success("Cập nhật bài viết thành công");
      }
    } catch (err) {
      toast.error("Lưu bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải nội dung...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/blog" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-700 outline-none focus:border-primary"
          >
            <option value="Draft">Bản nháp (Draft)</option>
            <option value="Published">Xuất bản (Published)</option>
            <option value="Archived">Lưu trữ (Archived)</option>
          </select>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn (Excerpt)</label>
              <textarea
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Đoạn trích dẫn hiển thị ở trang danh sách..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Nội dung bài viết</label>
            <TiptapEditor
              content={formData.contentJson}
              onChange={(json) => setFormData({ ...formData, contentJson: json })}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục</label>
              <select
                value={formData.blogCategoryId || ""}
                onChange={e => setFormData({ ...formData, blogCategoryId: e.target.value || null })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-primary"
              >
                <option value="">-- Chưa phân loại --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <hr className="border-slate-100" />

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh bìa (Thumbnail)</label>
              <div className="relative group">
                <div className={`w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden bg-slate-50 transition-colors ${!coverPreview ? 'hover:bg-slate-100 hover:border-primary/50' : ''}`}>
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500 font-medium">Nhấp để tải ảnh lên</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCover}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Featured */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-bold text-slate-700">Đánh dấu nổi bật (Featured)</span>
            </label>

          </div>
        </div>
      </div>
    </div>
  );
}

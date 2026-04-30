"use client";

import { useEffect, useState } from "react";
import { UploadCloud, FileArchive, Trash2, Loader2, CheckCircle } from "lucide-react";
import { adminProductApi } from "@/lib/api/products";
import { ProductFile } from "@/types/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Props {
  productId: string;
  token: string;
  initialFiles?: ProductFile[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FilesSection({ productId, token, initialFiles = [] }: Props) {
  const t = useTranslations("FilesSection");
  const [files, setFiles] = useState<ProductFile[]>(initialFiles.filter(f => f.fileType === 'SourceCodeArchive'));
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync when initialFiles changes (e.g. page loads data)
  useEffect(() => {
    setFiles(initialFiles.filter(f => f.fileType === 'SourceCodeArchive'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles.length]);

  const handleUpload = async (file: File) => {
    const validTypes = ['.zip', '.tar.gz', '.rar', '.7z'];
    const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      toast.error(t("invalidType"));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error(t("tooLarge"));
      return;
    }

    setIsUploading(true);
    try {
      const result = await adminProductApi.uploadFile(productId, file, "SourceCodeArchive", false, token) as ProductFile;
      setFiles(prev => [...prev, result]);
      toast.success(t("successUpload"));
    } catch {
      toast.error(t("failUpload"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await adminProductApi.deleteFile(productId, fileId, token);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success(t("successDelete"));
    } catch {
      toast.error(t("failDelete"));
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileArchive className="w-4 h-4 text-primary" /> {t("title")}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Upload zone */}
      <label
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50'}`}
      >
        <input type="file" accept=".zip,.tar.gz,.rar,.7z" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        {isUploading ? (
          <><Loader2 className="w-7 h-7 text-primary animate-spin mb-2" /><p className="text-sm font-medium text-slate-700">{t("uploading")}</p></>
        ) : (
          <><UploadCloud className={`w-7 h-7 mb-2 ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">{t("dragDrop")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("hint")}</p></>
        )}
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.fileName}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.fileSize)}</p>
              </div>
              <button onClick={() => handleDelete(file.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

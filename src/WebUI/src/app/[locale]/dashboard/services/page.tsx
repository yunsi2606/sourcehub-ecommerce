"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FileCode2, Clock, CheckCircle2, CircleDashed, AlertCircle, Pencil, X, Save, Loader2 } from "lucide-react";
import { adminServiceProjectApi } from "@/lib/api";
import { ServiceProjectDto } from "@/types/api";
import { CustomSelect } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const STATUS_OPTIONS = (t: any) => [
  { value: "Pending", label: t("optPending") },
  { value: "InProgress", label: t("optInProgress") },
  { value: "InReview", label: t("optInReview") },
  { value: "Completed", label: t("optCompleted") },
  { value: "Cancelled", label: t("optCancelled") },
];

export default function AdminServicesPage() {
  const t = useTranslations("DashboardServices");
  const accessToken = useAuthStore((s) => s.accessToken);
  const [projects, setProjects] = useState<ServiceProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal state
  const [editingProject, setEditingProject] = useState<ServiceProjectDto | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAdminNote, setEditAdminNote] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminServiceProjectApi
      .getAll(accessToken, statusFilter || undefined)
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load service projects."))
      .finally(() => setIsLoading(false));
  }, [accessToken, statusFilter]);

  const openEdit = (project: ServiceProjectDto) => {
    setEditingProject(project);
    setEditStatus(project.status);
    setEditAdminNote(project.adminNote || "");
    setEditDeadline(project.deadlineAt ? project.deadlineAt.split("T")[0] : "");
  };

  const handleSave = async () => {
    if (!editingProject || !accessToken) return;
    setIsSaving(true);
    try {
      await adminServiceProjectApi.update(editingProject.id, {
        status: editStatus,
        adminNote: editAdminNote || null,
        deadlineAt: editDeadline ? new Date(editDeadline).toISOString() : null,
        startedAt: editStatus === "InProgress" && !editingProject.startedAt ? new Date().toISOString() : editingProject.startedAt,
        completedAt: editStatus === "Completed" && !editingProject.completedAt ? new Date().toISOString() : editingProject.completedAt,
      }, accessToken);

      setProjects(prev => prev.map(p =>
        p.id === editingProject.id
          ? { ...p, status: editStatus as ServiceProjectDto["status"], adminNote: editAdminNote || null, deadlineAt: editDeadline ? new Date(editDeadline).toISOString() : null }
          : p
      ));
      setEditingProject(null);
      toast.success(t("toastSuccess"));
    } catch {
      toast.error(t("toastError"));
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending": return { label: "Pending", icon: <CircleDashed className="w-4 h-4" />, color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
      case "InProgress": return { label: "In Progress", icon: <Clock className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "InReview": return { label: "In Review", icon: <Clock className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
      case "Completed": return { label: "Completed", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "Cancelled": return { label: "Cancelled", icon: <AlertCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 border-red-200" };
      default: return { label: status, icon: <CircleDashed className="w-4 h-4" />, color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-slate-500 mt-1">{t("subtitle")}</p>
        </div>
        <div className="w-52">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: t("allStatus") },
              { value: "Pending", label: t("optPending") },
              { value: "InProgress", label: t("optInProgress") },
              { value: "InReview", label: t("optInReview") },
              { value: "Completed", label: t("optCompleted") },
              { value: "Cancelled", label: t("optCancelled") },
            ]}
            className="h-10 py-1.5"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileCode2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t("noProjects")}</h3>
          <p className="text-sm text-slate-400">{t("noProjectsDesc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const statusConfig = getStatusConfig(project.status);
            return (
              <div key={project.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{project.serviceName}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-xs">{t("createdAt")}</span>
                          <span className="font-medium">{formatDate(project.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs">{t("deadline")}</span>
                          <span className={`font-medium ${project.deadlineAt && new Date(project.deadlineAt) < new Date() && project.status !== 'Completed' ? 'text-red-600' : 'text-slate-900'}`}>
                            {formatDate(project.deadlineAt)}
                          </span>
                        </div>
                        {project.startedAt && (
                          <div>
                            <span className="text-slate-400 block text-xs">{t("startedAt")}</span>
                            <span className="font-medium">{formatDate(project.startedAt)}</span>
                          </div>
                        )}
                        {project.completedAt && (
                          <div>
                            <span className="text-slate-400 block text-xs">{t("completedAt")}</span>
                            <span className="font-medium text-emerald-600">{formatDate(project.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openEdit(project)}
                      className="shrink-0 h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" /> {t("updateBtn")}
                    </button>
                  </div>

                  {(project.adminNote || project.customerNote) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.adminNote && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t("adminNote")}</p>
                          <p className="text-sm text-slate-700">{project.adminNote}</p>
                        </div>
                      )}
                      {project.customerNote && (
                        <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{t("customerNote")}</p>
                          <p className="text-sm text-slate-700">{project.customerNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("updateModalTitle")}</h2>
                <p className="text-sm text-slate-500 truncate max-w-sm">{editingProject.serviceName}</p>
              </div>
              <button onClick={() => setEditingProject(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("statusLabel")}</label>
                <CustomSelect
                  value={editStatus}
                  onChange={setEditStatus}
                  options={STATUS_OPTIONS(t)}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("deadlineLabel")}</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={e => setEditDeadline(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("adminNoteLabel")}</label>
                <textarea
                  value={editAdminNote}
                  onChange={e => setEditAdminNote(e.target.value)}
                  rows={3}
                  placeholder={t("adminNotePlaceholder")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setEditingProject(null)} className="flex-1 h-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                {t("cancelBtn")}
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("saveBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

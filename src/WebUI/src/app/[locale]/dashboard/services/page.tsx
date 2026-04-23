"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FileCode2, Clock, CheckCircle2, CircleDashed, AlertCircle } from "lucide-react";
import { adminServiceProjectApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ServiceProjectDto } from "@/types/api";

export default function AdminServicesPage() {
  const t = useTranslations("Dashboard");
  const accessToken = useAuthStore((s) => s.accessToken);
  const [projects, setProjects] = useState<ServiceProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminServiceProjectApi
      .getAll(accessToken, statusFilter || undefined)
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load service projects."))
      .finally(() => setIsLoading(false));
  }, [accessToken, statusFilter]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Pending":
        return { label: t("statusPending"), icon: <CircleDashed className="w-4 h-4" />, color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
      case "InProgress":
      case "InReview":
        return { label: t("statusInProgress"), icon: <Clock className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "Completed":
        return { label: t("statusCompleted"), icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "Cancelled":
        return { label: "Cancelled", icon: <AlertCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 border-red-200" };
      default:
        return { label: status, icon: <CircleDashed className="w-4 h-4" />, color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("services")}</h1>
          <p className="text-slate-500 mt-1">{t("servicesDesc")}</p>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Pending</option>
          <option value="InProgress">In Progress</option>
          <option value="InReview">In Review</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
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
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t("noOrders")}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const statusConfig = getStatusDisplay(project.status);
            return (
              <div key={project.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{project.serviceName}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-xs">{t("date")}</span>
                          <span className="font-medium">{formatDate(project.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs">{t("deadline")}</span>
                          <span className="font-medium text-slate-900">{formatDate(project.deadlineAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="shrink-0 flex items-center gap-3 mt-4 md:mt-0">
                      <button className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors text-sm">
                        {t("viewDetails")}
                      </button>
                    </div>
                  </div>

                  {/* Notes Section (if any) */}
                  {(project.adminNote || project.customerNote) && (
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {project.adminNote && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Note</p>
                          <p className="text-sm text-slate-700">{project.adminNote}</p>
                        </div>
                      )}
                      {project.customerNote && (
                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Customer Note</p>
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
    </div>
  );
}

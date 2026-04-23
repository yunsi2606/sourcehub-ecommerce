"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LayoutDashboard, ShoppingBag, Download, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import React from "react";
import DashboardLoading from "./loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, clearAuth } = useAuthStore();
  const [isRestoring, setIsRestoring] = React.useState(!accessToken);

  React.useEffect(() => {
    if (!accessToken) {
      import("@/lib/api/client").then((mod) => {
        mod.tryRefreshToken().finally(() => setIsRestoring(false));
      });
    } else {
      setIsRestoring(false);
    }
  }, [accessToken]);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
    clearAuth();
    router.replace("/login");
  };

  const getLinkClass = (path: string) => {
    // Xóa prefix locale (VD: /vi/dashboard -> /dashboard) nếu có
    const normalizedPathname = pathname.replace(/^\/(en|vi)/, '') || '/';
    
    const isActive = path === "/dashboard"
      ? normalizedPathname === "/dashboard" || normalizedPathname === "/"
      : normalizedPathname.startsWith(path);

    return isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors bg-primary/10 text-primary"
      : "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  };

  if (isRestoring) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mock Sidebar to prevent jump */}
          <aside className="w-full md:w-64 shrink-0 hidden md:block opacity-50">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm min-h-[400px]"></div>
          </aside>
          
          <main className="flex-1 min-w-0">
            <DashboardLoading />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm sticky top-24">

            <div className="flex items-center gap-3 p-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || "Admin User"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                <LayoutDashboard className="w-5 h-5" />
                {t("overview")}
              </Link>
              <Link href="/dashboard/orders" className={getLinkClass("/dashboard/orders")}>
                <ShoppingBag className="w-5 h-5" />
                {t("orders")}
              </Link>
              <Link href="/dashboard/products" className={getLinkClass("/dashboard/products")}>
                <Download className="w-5 h-5" />
                {t("products")}
              </Link>
              <Link href="/dashboard/services" className={getLinkClass("/dashboard/services")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                {t("services")}
              </Link>
              <Link href="/dashboard/settings" className={getLinkClass("/dashboard/settings")}>
                <Settings className="w-5 h-5" />
                {t("settings")}
              </Link>
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                {t("logout")}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}

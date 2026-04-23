"use client";

import { Link } from "@/i18n/routing";
import { Search, ShoppingCart, User, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

export function Navbar({ initialIsLoggedIn = false }: { initialIsLoggedIn?: boolean }) {
  const t = useTranslations("Navbar");
  const { user } = useAuthStore();
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    // When the user state changes (login/logout), re-evaluate based on the real cookie
    import("js-cookie").then((Cookies) => {
      setIsLoggedIn(Cookies.default.get("user_role") !== undefined);
    });
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-muted bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            SourceHub
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/products" className="hover:text-primary transition-colors">{t("products")}</Link>
            <Link href="/services" className="hover:text-primary transition-colors">{t("services")}</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">{t("pricing")}</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">{t("blog")}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t("search")}
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Link href="/cart" className="p-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-full transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">0</span>
          </Link>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-all">
                <User className="w-4 h-4" />
                {t("profile")}
              </Link>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-all">
              <User className="w-4 h-4" />
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

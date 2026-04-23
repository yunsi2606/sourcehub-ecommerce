import { useTranslations } from "next-intl";
import { User as UserIcon } from "lucide-react";
import { AuthUser } from "@/types/api";

interface PersonalInfoSectionProps {
  user: AuthUser;
}

export default function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const t = useTranslations("Profile");

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <UserIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-slate-900">{t("personalInfo")}</h2>
      </div>
      
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-white shadow-sm overflow-hidden">
          {user.email?.[0].toUpperCase()}
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">{user.role}</div>
          <div className="text-xl font-bold text-slate-900">{user.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t("fullName")}</label>
          <input
            type="text"
            defaultValue={user.email?.split('@')[0]}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t("email")}</label>
          <input
            type="email"
            defaultValue={user.email}
            readOnly
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button className="h-11 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft">
          {t("saveChanges")}
        </button>
      </div>
    </div>
  );
}

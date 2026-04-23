import { getTranslations } from "next-intl/server";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t("title")}</h1>
        <p className="text-slate-500 mt-2">{t("subtitle")}</p>
      </div>

      <ProfileForm />
    </div>
  );
}

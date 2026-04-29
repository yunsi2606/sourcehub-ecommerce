"use client";

import { useTranslations } from "next-intl";
import { Shield, Smartphone, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthUser } from "@/types/api";
import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface SecuritySectionProps {
  user: AuthUser;
}

export default function SecuritySection({ user }: SecuritySectionProps) {
  const t = useTranslations("Profile");
  const { setAuth } = useAuthStore();
  
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUri: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ secret: string; qrCodeUri: string }>("/oauth/totp/setup", {
        method: "POST",
      });
      setSetupData(data);
      setIsSetupOpen(true);
    } catch (err: unknown) {
      toast.error(t("failStartSetup"));
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async () => {
    if (!otp || otp.length !== 6) return;
    setLoading(true);
    try {
      await apiFetch("/oauth/totp/confirm", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      
      // Update local state
      setAuth({ ...user, totpEnabled: true }, useAuthStore.getState().accessToken!);
      setIsSetupOpen(false);
      setSetupData(null);
      setOtp("");
      toast.success(t("successEnable"));
    } catch (err: unknown) {
      toast.error(t("failVerify"));
    } finally {
      setLoading(false);
    }
  };

  const disableTotp = async () => {
    if (!confirm(t("confirmDisable"))) return;
    
    setLoading(true);
    try {
      await apiFetch("/oauth/totp", {
        method: "DELETE",
      });
      
      // Update local state
      setAuth({ ...user, totpEnabled: false }, useAuthStore.getState().accessToken!);
      toast.success(t("successDisable"));
    } catch (err: unknown) {
      toast.error(t("failDisable"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-slate-900">{t("securitySettings")}</h2>
      </div>

      <div className="flex items-start justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.totpEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              {t("twoFactorAuth")}
              {user.totpEnabled && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              {t("twoFactorDesc")}
            </p>
          </div>
        </div>

        <div>
          {user.totpEnabled ? (
            <button 
              onClick={disableTotp}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {t("disable2FA")}
            </button>
          ) : (
            <button 
              onClick={startSetup}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {t("enable2FA")}
            </button>
          )}
        </div>
      </div>

      {/* Setup Wizard */}
      {isSetupOpen && setupData && (
        <div className="mt-6 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            {t("setupGoogleAuth")}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-sm text-slate-600">
              <p>{t("step1")}</p>
              <p>{t("step2")}</p>
              <p>{t("step3")}</p>
              
              <div className="pt-4">
                <input
                  type="text"
                  placeholder={t("enterCodePlaceholder")}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={confirmSetup}
                    disabled={otp.length !== 6 || loading}
                    className="flex-1 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {t("confirmEnable")}
                  </button>
                  <button 
                    onClick={() => {
                      setIsSetupOpen(false);
                      setSetupData(null);
                    }}
                    className="px-4 h-10 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200">
              {/* Generate QR Code dynamically via API */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUri)}`} 
                alt="2FA QR Code"
                className="w-48 h-48 rounded-lg shadow-sm"
              />
              <p className="mt-4 text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-md">
                {setupData.secret}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

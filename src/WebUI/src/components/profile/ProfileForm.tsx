"use client";

import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
import BillingSection from "./form/BillingSection";
import PersonalInfoSection from "./form/PersonalInfoSection";
import SecuritySection from "./form/SecuritySection";

export default function ProfileForm() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personal Info Section */}
      <PersonalInfoSection user={user} />

      {/* Security & 2FA Section */}
      <SecuritySection user={user} />

      {/* Billing & Subscription Section */}
      <BillingSection />
    </div>
  );
}

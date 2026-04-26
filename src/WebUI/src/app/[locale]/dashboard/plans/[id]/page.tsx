"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Save, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { adminPlansApi } from "@/lib/api/plans";
import { UpsertPlanRequest } from "@/lib/types/plans";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";

export default function PlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<UpsertPlanRequest>({
    name: "",
    slug: "",
    description: "",
    tier: 1,
    monthlyPrice: 0,
    yearlyPrice: 0,
    isActive: true,
    featuresJson: "[]",
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  });

  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (!isNew && accessToken) {
      adminPlansApi.getById(accessToken, id)
        .then((plan) => {
          setFormData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            tier: plan.tier,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
            isActive: plan.isActive,
            featuresJson: JSON.stringify(plan.features),
            stripePriceIdMonthly: "", // Would need to fetch these if we exposed them in PlanDto, but usually they are admin-only config
            stripePriceIdYearly: "",
          });
          setFeaturesList(plan.features || []);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Plan not found");
          router.push("/dashboard/plans");
        });
    }
  }, [id, isNew, accessToken, router]);

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFeaturesList([...featuresList, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Plan name is required");
    if (!accessToken) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        featuresJson: JSON.stringify(featuresList),
        stripePriceIdMonthly: formData.stripePriceIdMonthly || null,
        stripePriceIdYearly: formData.stripePriceIdYearly || null,
      };

      if (isNew) {
        await adminPlansApi.create(accessToken, payload);
        toast.success("Plan created successfully");
      } else {
        await adminPlansApi.update(accessToken, id, payload);
        toast.success("Plan updated successfully");
      }
      router.push("/dashboard/plans");
    } catch (err) {
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading plan...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/plans" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isNew ? "Create Plan" : "Edit Plan"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer mr-4">
            <span className="text-sm font-semibold text-slate-700">Active</span>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Basic Info</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tier Level (e.g. 1, 2, 3)</label>
            <input
              type="number"
              value={formData.tier}
              onChange={e => setFormData({ ...formData, tier: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stripe */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Pricing (VND) & Stripe</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Price</label>
              <input
                type="number"
                value={formData.monthlyPrice}
                onChange={e => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Yearly Price</label>
              <input
                type="number"
                value={formData.yearlyPrice}
                onChange={e => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">Stripe Price ID (Monthly)</label>
            <input
              type="text"
              value={formData.stripePriceIdMonthly || ""}
              onChange={e => setFormData({ ...formData, stripePriceIdMonthly: e.target.value })}
              placeholder="price_12345..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Stripe Price ID (Yearly)</label>
            <input
              type="text"
              value={formData.stripePriceIdYearly || ""}
              onChange={e => setFormData({ ...formData, stripePriceIdYearly: e.target.value })}
              placeholder="price_67890..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Features */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Plan Features</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddFeature()}
              placeholder="Type a feature and press enter..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {featuresList.map((f, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{f}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {featuresList.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No features added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

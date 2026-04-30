"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2, Package } from "lucide-react";
import { adminProductApi } from "@/lib/api/products";
import { ProductAddon } from "@/types/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Props {
  productId: string;
  token: string;
}

interface AddonForm {
  name: string;
  description: string;
  price: string; // string for input binding
}

const emptyForm: AddonForm = { name: "", description: "", price: "0" };

export function AddonsSection({ productId, token }: Props) {
  const t = useTranslations("AddonsSection");
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState<AddonForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddonForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminProductApi.getAddons(productId, token)
      .then(setAddons)
      .catch(() => toast.error(t("failLoad")))
      .finally(() => setIsLoading(false));
  }, [productId, token, t]);

  const handleCreate = async () => {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await adminProductApi.createAddon(productId, {
        name: newForm.name.trim(),
        description: newForm.description.trim(),
        price: parseFloat(newForm.price) || 0,
      }, token);
      setAddons(prev => [...prev, created]);
      setNewForm(emptyForm);
      setShowAddForm(false);
      toast.success(t("successAdd"));
    } catch {
      toast.error(t("failAdd"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (addon: ProductAddon) => {
    setEditingId(addon.id);
    setEditForm({ name: addon.name, description: addon.description, price: String(addon.price) });
  };

  const handleUpdate = async (addonId: string) => {
    setSaving(true);
    try {
      const updated = await adminProductApi.updateAddon(productId, addonId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: parseFloat(editForm.price) || 0,
      }, token);
      setAddons(prev => prev.map(a => a.id === addonId ? updated : a));
      setEditingId(null);
      toast.success(t("successUpdate"));
    } catch {
      toast.error(t("failUpdate"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (addon: ProductAddon) => {
    try {
      const updated = await adminProductApi.updateAddon(productId, addon.id, { isActive: !addon.isActive }, token);
      setAddons(prev => prev.map(a => a.id === addon.id ? updated : a));
    } catch {
      toast.error(t("failToggle"));
    }
  };

  const handleDelete = async (addonId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await adminProductApi.deleteAddon(productId, addonId, token);
      setAddons(prev => prev.filter(a => a.id !== addonId));
      toast.success(t("successDelete"));
    } catch {
      toast.error(t("failDelete"));
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> {t("title")}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {t("addBtn")}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-2">
          {addons.length === 0 && !showAddForm && (
            <p className="text-sm text-slate-400 text-center py-4">{t("empty")}</p>
          )}

          {addons.map(addon => (
            <div key={addon.id} className={`rounded-xl border p-3 transition-colors ${addon.isActive ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
              {editingId === addon.id ? (
                // Edit row
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-8 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={editForm.name}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={t("namePlaceholder")}
                    />
                    <input
                      className="w-28 h-8 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))}
                      placeholder={t("pricePlaceholder")}
                    />
                  </div>
                  <input
                    className="w-full h-8 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={editForm.description}
                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={t("descPlaceholder")}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="h-7 px-3 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">{t("cancelBtn")}</button>
                    <button onClick={() => handleUpdate(addon.id)} disabled={saving} className="h-7 px-3 text-xs rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover flex items-center gap-1 disabled:opacity-50">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} {t("saveBtn")}
                    </button>
                  </div>
                </div>
              ) : (
                // Display row
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{addon.name}</p>
                    {addon.description && <p className="text-xs text-slate-400 truncate">{addon.description}</p>}
                  </div>
                  <span className={`shrink-0 text-sm font-bold px-2 py-0.5 rounded-lg ${addon.price === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>
                    {addon.price === 0 ? t("free") : `+${addon.price.toLocaleString("vi-VN")}₫`}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggleActive(addon)} title={addon.isActive ? t("hide") : t("show")}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${addon.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(addon)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(addon.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add new form */}
          {showAddForm && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 h-8 px-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={newForm.name}
                  onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={t("namePlaceholder")}
                  autoFocus
                />
                <input
                  className="w-28 h-8 px-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  type="number"
                  min="0"
                  value={newForm.price}
                  onChange={e => setNewForm(p => ({ ...p, price: e.target.value }))}
                  placeholder={t("pricePlaceholder")}
                />
              </div>
              <input
                className="w-full h-8 px-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newForm.description}
                onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                placeholder={t("descPlaceholder")}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowAddForm(false); setNewForm(emptyForm); }}
                  className="h-7 px-3 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1">
                  <X className="w-3 h-3" /> {t("cancelBtn")}
                </button>
                <button onClick={handleCreate} disabled={saving || !newForm.name.trim()}
                  className="h-7 px-3 text-xs rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover flex items-center gap-1 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} {t("addSubmitBtn")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

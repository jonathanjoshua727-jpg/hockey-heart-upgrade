import { useState, useEffect } from "react";
import {
  getDonationCauses,
  saveDonationCause,
  deleteDonationCause,
  logActivity,
  type DonationCause,
} from "@/lib/contentStore";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";

function emptyCause(): DonationCause {
  return {
    id: crypto.randomUUID(),
    label: "",
    description: "",
    active: true,
    order: 99,
  };
}

export function DonationCausesSection() {
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [editing, setEditing] = useState<DonationCause | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() {
    setCauses(getDonationCauses());
  }
  useEffect(() => { refresh(); }, []);

  function handleSave() {
    if (!editing || !editing.label.trim()) return;
    saveDonationCause(editing);
    logActivity(
      causes.some((c) => c.id === editing.id) ? "EDIT" : "CREATE",
      "Donation Causes",
      `Cause: "${editing.label}"`
    );
    setEditing(null);
    refresh();
  }

  function handleToggle(c: DonationCause) {
    saveDonationCause({ ...c, active: !c.active });
    logActivity("TOGGLE", "Donation Causes", `${!c.active ? "Enabled" : "Disabled"}: "${c.label}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const c = causes.find((x) => x.id === id);
    deleteDonationCause(id);
    logActivity("DELETE", "Donation Causes", `Deleted: "${c?.label}"`);
    setDeleteConfirm(null);
    refresh();
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {causes.some((c) => c.id === editing.id) ? "Edit Cause" : "New Donation Cause"}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Label *</label>
            <input
              value={editing.label}
              onChange={(e) => setEditing((v) => v && { ...v, label: e.target.value })}
              placeholder="e.g. Equipment & Gear"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <input
              value={editing.description}
              onChange={(e) => setEditing((v) => v && { ...v, description: e.target.value })}
              placeholder="Short description shown to donors"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Sort Order</label>
            <input
              type="number"
              min={0}
              value={editing.order}
              onChange={(e) => setEditing((v) => v && { ...v, order: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEditing((v) => v && { ...v, active: !v.active })}
              className={`w-10 h-6 rounded-full transition-colors relative ${editing.active ? "bg-[#0a1f44]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700">Active (visible to donors)</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Cause
            </button>
            <button
              onClick={() => setEditing(null)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Donation Causes</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Causes displayed on the public donation form. {causes.filter((c) => c.active).length} active.
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyCause())}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Cause
        </button>
      </div>

      <div className="space-y-3">
        {causes.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">
            No donation causes configured.
          </div>
        )}
        {causes.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{c.label}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.active ? "Active" : "Hidden"}
                </span>
              </div>
              {c.description && <p className="text-gray-500 text-sm mt-1">{c.description}</p>}
              <p className="text-gray-300 text-xs mt-1">Order: {c.order}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleToggle(c)} title={c.active ? "Disable" : "Enable"} className={`p-2 rounded-lg transition-colors ${c.active ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                {c.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => setEditing({ ...c })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              {deleteConfirm === c.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(c.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

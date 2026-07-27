import { useState, useEffect } from "react";
import {
  getPrograms,
  saveProgram,
  deleteProgram,
  logActivity,
  type Program,
} from "@/lib/contentStore";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";

function emptyProgram(): Program {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    content: "",
    icon: "🏒",
    active: true,
    order: 99,
  };
}

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editing, setEditing] = useState<Program | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() { setPrograms(getPrograms()); }
  useEffect(() => { refresh(); }, []);

  function handleSave() {
    if (!editing || !editing.title.trim()) return;
    saveProgram(editing);
    logActivity(
      programs.some((p) => p.id === editing.id) ? "EDIT" : "CREATE",
      "Programs",
      `Program: "${editing.title}"`
    );
    setEditing(null);
    refresh();
  }

  function handleToggle(p: Program) {
    saveProgram({ ...p, active: !p.active });
    logActivity("TOGGLE", "Programs", `${!p.active ? "Enabled" : "Disabled"}: "${p.title}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const p = programs.find((x) => x.id === id);
    deleteProgram(id);
    logActivity("DELETE", "Programs", `Deleted: "${p?.title}"`);
    setDeleteConfirm(null);
    refresh();
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {programs.some((p) => p.id === editing.id) ? "Edit Program" : "New Program"}
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <input value={editing.title} onChange={(e) => setEditing((v) => v && { ...v, title: e.target.value })} placeholder="Program title" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Icon (emoji)</label>
              <input value={editing.icon} onChange={(e) => setEditing((v) => v && { ...v, icon: e.target.value })} placeholder="🏒" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" min={0} value={editing.order} onChange={(e) => setEditing((v) => v && { ...v, order: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Short Description *</label>
              <textarea value={editing.description} onChange={(e) => setEditing((v) => v && { ...v, description: e.target.value })} rows={2} placeholder="Shown in listings" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-none" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Content (HTML supported)</label>
              <textarea value={editing.content} onChange={(e) => setEditing((v) => v && { ...v, content: e.target.value })} rows={6} placeholder="<p>Full program details...</p>" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-y" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Image URL (optional)</label>
              <input value={editing.imageUrl ?? ""} onChange={(e) => setEditing((v) => v && { ...v, imageUrl: e.target.value })} placeholder="https://... or leave blank" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEditing((v) => v && { ...v, active: !v.active })} className={`w-10 h-6 rounded-full transition-colors relative ${editing.active ? "bg-[#0a1f44]" : "bg-gray-200"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700">Active (visible on site)</span>
          </label>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
              <Save className="w-4 h-4" /> Save Program
            </button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
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
          <h2 className="text-xl font-bold text-gray-900">Programs</h2>
          <p className="text-gray-500 text-sm mt-0.5">{programs.length} programs · {programs.filter((p) => p.active).length} active</p>
        </div>
        <button onClick={() => setEditing(emptyProgram())} className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Program
        </button>
      </div>
      <div className="space-y-3">
        {programs.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">No programs yet.</div>
        )}
        {programs.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-[#a8d8ea]/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{p.icon}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.active ? "Active" : "Hidden"}</span>
                </div>
                <p className="text-gray-500 text-sm truncate">{p.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleToggle(p)} className={`p-2 rounded-lg transition-colors ${p.active ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                {p.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => setEditing({ ...p })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              {deleteConfirm === p.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
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

import { useState, useEffect } from "react";
import {
  getFaqs,
  saveFaq,
  deleteFaq,
  logActivity,
  type Faq,
} from "@/lib/contentStore";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, Eye, EyeOff } from "lucide-react";

function emptyFaq(order: number): Faq {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
    category: "General",
    order,
    published: true,
  };
}

export function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  function refresh() { setFaqs(getFaqs()); }
  useEffect(() => { refresh(); }, []);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));
  const filtered = filterCategory === "All" ? faqs : faqs.filter((f) => f.category === filterCategory);

  function handleSave() {
    if (!editing || !editing.question.trim() || !editing.answer.trim()) return;
    saveFaq(editing);
    logActivity(
      faqs.some((f) => f.id === editing.id) ? "EDIT" : "CREATE",
      "FAQs",
      `FAQ: "${editing.question.slice(0, 50)}..."`
    );
    setEditing(null);
    refresh();
  }

  function handleTogglePublish(f: Faq) {
    saveFaq({ ...f, published: !f.published });
    logActivity("TOGGLE", "FAQs", `${!f.published ? "Published" : "Unpublished"}: "${f.question.slice(0, 40)}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const f = faqs.find((x) => x.id === id);
    deleteFaq(id);
    logActivity("DELETE", "FAQs", `Deleted FAQ: "${f?.question?.slice(0, 40)}"`);
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
            {faqs.some((f) => f.id === editing.id) ? "Edit FAQ" : "New FAQ"}
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Question *</label>
              <input value={editing.question} onChange={(e) => setEditing((v) => v && { ...v, question: e.target.value })} placeholder="e.g. What payment methods do you accept?" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Answer *</label>
              <textarea value={editing.answer} onChange={(e) => setEditing((v) => v && { ...v, answer: e.target.value })} rows={5} placeholder="Full answer shown to visitors..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input value={editing.category} onChange={(e) => setEditing((v) => v && { ...v, category: e.target.value })} placeholder="e.g. Donations, Programs, About Us" list="faq-categories" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
              <datalist id="faq-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" min={0} value={editing.order} onChange={(e) => setEditing((v) => v && { ...v, order: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEditing((v) => v && { ...v, published: !v.published })} className={`w-10 h-6 rounded-full transition-colors relative ${editing.published ? "bg-[#0a1f44]" : "bg-gray-200"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.published ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700">Published</span>
          </label>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
              <Save className="w-4 h-4" /> Save FAQ
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
          <h2 className="text-xl font-bold text-gray-900">FAQs</h2>
          <p className="text-gray-500 text-sm mt-0.5">{faqs.length} questions · {faqs.filter((f) => f.published).length} published</p>
        </div>
        <button onClick={() => setEditing(emptyFaq(faqs.length))} className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
          <Plus className="w-4 h-4" /> New FAQ
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterCategory === c ? "bg-[#0a1f44] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">No FAQs found.</div>
        )}
        {filtered.map((f) => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#a8d8ea]/20 text-[#0a1f44] text-xs font-semibold px-2 py-0.5 rounded-full">{f.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{f.published ? "Published" : "Draft"}</span>
              </div>
              <p className="font-semibold text-gray-900">{f.question}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{f.answer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleTogglePublish(f)} title={f.published ? "Unpublish" : "Publish"} className={`p-2 rounded-lg transition-colors ${f.published ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                {f.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditing({ ...f })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              {deleteConfirm === f.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(f.id)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(f.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
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

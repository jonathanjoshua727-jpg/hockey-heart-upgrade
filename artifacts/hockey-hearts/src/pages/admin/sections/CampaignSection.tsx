import { useState, useEffect } from "react";
import {
  getCampaigns,
  saveCampaign,
  deleteCampaign,
  logActivity,
  type Campaign,
} from "@/lib/contentStore";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Save, X } from "lucide-react";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CATEGORIES = [
  "Equipment & Gear",
  "Ice Time & Training Support",
  "Youth Hockey Development",
  "Community Hockey Programs",
  "Community Outreach",
  "Hockey Education",
  "General Fund",
];

function emptyCampaign(): Campaign {
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: "",
    description: "",
    goal: 10000,
    raised: 0,
    deadline: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    category: "General Fund",
    featured: false,
    active: true,
    content: "",
  };
}

export function CampaignSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() {
    setCampaigns(getCampaigns());
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditing(emptyCampaign());
  }

  function startEdit(c: Campaign) {
    setEditing({ ...c });
  }

  function handleSave() {
    if (!editing) return;
    const slug = editing.slug || slugify(editing.title);
    const toSave = { ...editing, slug };
    saveCampaign(toSave);
    logActivity(
      campaigns.some((c) => c.id === editing.id) ? "EDIT" : "CREATE",
      "Campaigns",
      `Campaign: "${toSave.title}"`
    );
    setEditing(null);
    refresh();
  }

  function handleToggleActive(c: Campaign) {
    const updated = { ...c, active: !c.active };
    saveCampaign(updated);
    logActivity("TOGGLE", "Campaigns", `${updated.active ? "Activated" : "Disabled"}: "${c.title}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const c = campaigns.find((x) => x.id === id);
    deleteCampaign(id);
    logActivity("DELETE", "Campaigns", `Deleted: "${c?.title}"`);
    setDeleteConfirm(null);
    refresh();
  }

  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {campaigns.some((c) => c.id === editing.id) ? "Edit Campaign" : "New Campaign"}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Campaign Title *</label>
              <input
                value={editing.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditing((v) => v && { ...v, title, slug: slugify(title) });
                }}
                placeholder="Campaign title"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Slug (URL)</label>
              <input
                value={editing.slug}
                onChange={(e) => setEditing((v) => v && { ...v, slug: e.target.value })}
                placeholder="auto-generated"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
              <p className="text-xs text-gray-400">/campaigns/{editing.slug || "your-slug"}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={editing.category}
                onChange={(e) => setEditing((v) => v && { ...v, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Fundraising Goal ($)</label>
              <input
                type="number"
                min={0}
                value={editing.goal}
                onChange={(e) => setEditing((v) => v && { ...v, goal: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Amount Raised ($)</label>
              <input
                type="number"
                min={0}
                value={editing.raised}
                onChange={(e) => setEditing((v) => v && { ...v, raised: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                value={editing.deadline}
                onChange={(e) => setEditing((v) => v && { ...v, deadline: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Short Description *</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing((v) => v && { ...v, description: e.target.value })}
                placeholder="A concise description shown in campaign listings"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Content (HTML supported)</label>
              <textarea
                value={editing.content || ""}
                onChange={(e) => setEditing((v) => v && { ...v, content: e.target.value })}
                placeholder="<p>Full campaign description shown on the campaign detail page.</p>"
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-y"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 pt-2 border-t border-gray-100">
            {([
              { key: "active", label: "Active (visible on site)" },
              { key: "featured", label: "Featured on homepage" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEditing((v) => v && { ...v, [key]: !v[key] })}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    editing[key] ? "bg-[#0a1f44]" : "bg-gray-200"
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      editing[key] ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Campaign
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
          <h2 className="text-xl font-bold text-gray-900">Donation Campaigns</h2>
          <p className="text-gray-500 text-sm mt-0.5">{campaigns.length} campaigns total</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search campaigns…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">
            No campaigns found.
          </div>
        )}
        {filtered.map((c) => {
          const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#a8d8ea]/20 text-[#0a1f44] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {c.category}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.active ? "Active" : "Disabled"}
                    </span>
                    {c.featured && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-400">
                    ${c.raised.toLocaleString()} raised of ${c.goal.toLocaleString()} goal · Deadline: {c.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(c)}
                    title={c.active ? "Disable" : "Activate"}
                    className={`p-2 rounded-lg transition-colors ${
                      c.active ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {c.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === c.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-[#a8d8ea]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

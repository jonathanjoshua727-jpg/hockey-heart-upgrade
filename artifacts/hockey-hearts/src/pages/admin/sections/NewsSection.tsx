import { useState, useEffect } from "react";
import {
  getArticles,
  saveArticle,
  deleteArticle,
  logActivity,
  type NewsArticle,
} from "@/lib/contentStore";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORIES = ["Announcement", "Campaign Update", "Programs", "Events", "Impact", "News"];

function emptyArticle(): NewsArticle {
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "Announcement",
    author: "HHI Communications Team",
    excerpt: "",
    content: "",
    tags: [],
    featured: false,
    published: false,
    pinned: false,
  };
}

export function NewsSection() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() {
    setArticles(getArticles());
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditing(emptyArticle());
    setTagInput("");
  }

  function startEdit(a: NewsArticle) {
    setEditing({ ...a });
    setTagInput(a.tags.join(", "));
  }

  function cancelEdit() {
    setEditing(null);
    setTagInput("");
  }

  function handleSave() {
    if (!editing) return;
    const slug = editing.slug || slugify(editing.title);
    const toSave = { ...editing, slug };
    saveArticle(toSave);
    logActivity(
      articles.some((a) => a.id === editing.id) ? "EDIT" : "CREATE",
      "News",
      `Article: "${toSave.title}"`
    );
    setEditing(null);
    refresh();
  }

  function handleTogglePublish(a: NewsArticle) {
    const updated = { ...a, published: !a.published };
    saveArticle(updated);
    logActivity("TOGGLE", "News", `${updated.published ? "Published" : "Unpublished"}: "${a.title}"`);
    refresh();
  }

  function handleTogglePin(a: NewsArticle) {
    const updated = { ...a, pinned: !a.pinned };
    saveArticle(updated);
    logActivity("PIN", "News", `${updated.pinned ? "Pinned" : "Unpinned"}: "${a.title}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const a = articles.find((x) => x.id === id);
    deleteArticle(id);
    logActivity("DELETE", "News", `Deleted article: "${a?.title}"`);
    setDeleteConfirm(null);
    refresh();
  }

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {articles.some((a) => a.id === editing.id) ? "Edit Article" : "New Article"}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <input
                value={editing.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditing((v) => v && { ...v, title, slug: slugify(title) });
                }}
                placeholder="Article title"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Slug (URL)</label>
              <input
                value={editing.slug}
                onChange={(e) => setEditing((v) => v && { ...v, slug: e.target.value })}
                placeholder="auto-generated"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] font-mono"
              />
              <p className="text-xs text-gray-400">URL: /news/{editing.slug || "your-slug"}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={editing.date}
                onChange={(e) => setEditing((v) => v && { ...v, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
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
              <label className="text-sm font-medium text-gray-700">Author</label>
              <input
                value={editing.author}
                onChange={(e) => setEditing((v) => v && { ...v, author: e.target.value })}
                placeholder="Author name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Excerpt *</label>
              <textarea
                value={editing.excerpt}
                onChange={(e) => setEditing((v) => v && { ...v, excerpt: e.target.value })}
                placeholder="Short summary shown in article listings"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Content (HTML supported)</label>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing((v) => v && { ...v, content: e.target.value })}
                placeholder="<p>Full article content goes here. HTML tags like <strong>, <ul>, <h3> are supported.</p>"
                rows={10}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44] resize-y font-mono"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setEditing((v) =>
                    v && {
                      ...v,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }
                  );
                }}
                placeholder="Hockey, Community, Youth"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            {([
              { key: "published", label: "Published" },
              { key: "featured", label: "Featured" },
              { key: "pinned", label: "Pinned / Highlighted" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEditing((v) => v && { ...v, [key]: !v[key as keyof NewsArticle] })}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    editing[key as keyof NewsArticle] ? "bg-[#0a1f44]" : "bg-gray-200"
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      editing[key as keyof NewsArticle] ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Article
            </button>
            <button
              onClick={cancelEdit}
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
          <h2 className="text-xl font-bold text-gray-900">News & Updates</h2>
          <p className="text-gray-500 text-sm mt-0.5">{articles.length} articles total</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search articles…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">
            No articles found.
          </div>
        )}
        {filtered.map((a) => (
          <div
            key={a.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#a8d8ea]/20 text-[#0a1f44] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {a.category}
                </span>
                {a.published && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Published
                  </span>
                )}
                {!a.published && (
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Draft
                  </span>
                )}
                {a.pinned && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Pinned
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 truncate">{a.title}</p>
              <p className="text-xs text-gray-400">
                {a.date} · {a.author} · /news/{a.slug}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleTogglePin(a)}
                title={a.pinned ? "Unpin" : "Pin"}
                className={`p-2 rounded-lg transition-colors ${
                  a.pinned ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTogglePublish(a)}
                title={a.published ? "Unpublish" : "Publish"}
                className={`p-2 rounded-lg transition-colors ${
                  a.published ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                {a.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => startEdit(a)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {deleteConfirm === a.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(a.id)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
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

import { useState, useEffect, useRef } from "react";
import {
  getGalleryImages,
  saveGalleryImage,
  deleteGalleryImage,
  logActivity,
  type GalleryImage,
} from "@/lib/contentStore";
import { Upload, Trash2, Image as ImageIcon, Plus } from "lucide-react";

const SECTIONS = [
  "Hero", "About", "Campaigns", "News", "Programs", "Donation", "Team", "Gallery", "Other",
];

function emptyImage(): GalleryImage {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    section: "Gallery",
    alt: "",
    uploadedAt: new Date().toISOString(),
  };
}

export function ImagesSection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<GalleryImage>(emptyImage());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>("All");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() { setImages(getGalleryImages()); }
  useEffect(() => { refresh(); }, []);

  const filtered = filterSection === "All" ? images : images.filter((i) => i.section === filterSection);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((v) => ({
        ...v,
        url: ev.target?.result as string,
        name: v.name || file.name.replace(/\.[^.]+$/, ""),
        alt: v.alt || file.name.replace(/\.[^.]+$/, ""),
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.url.trim() || !form.name.trim()) return;
    saveGalleryImage(form);
    logActivity("CREATE", "Images", `Added image: "${form.name}" (${form.section})`);
    setAdding(false);
    setForm(emptyImage());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
  }

  function handleDelete(id: string) {
    const img = images.find((i) => i.id === id);
    deleteGalleryImage(id);
    logActivity("DELETE", "Images", `Deleted image: "${img?.name}"`);
    setDeleteConfirm(null);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Images & Gallery</h2>
          <p className="text-gray-500 text-sm mt-0.5">{images.length} images in the gallery.</p>
        </div>
        {!adding && (
          <button onClick={() => { setAdding(true); setForm(emptyImage()); }} className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
            <Plus className="w-4 h-4" /> Upload Image
          </button>
        )}
      </div>

      {/* Upload form */}
      {adding && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-gray-900">Add New Image</h3>

          {/* File upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0a1f44]/40 transition-colors"
          >
            {form.url && (form.url.startsWith("data:") || form.url.startsWith("http")) ? (
              <img src={form.url} alt="Preview" className="h-32 object-contain mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500">Click to upload an image file</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="e.g. Hero Banner 2026" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Section</label>
              <select value={form.section} onChange={(e) => setForm((v) => ({ ...v, section: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]">
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Image URL (or upload above)</label>
              <input value={form.url.startsWith("data:") ? "(uploaded file)" : form.url} onChange={(e) => { if (!e.target.value.startsWith("data:")) setForm((v) => ({ ...v, url: e.target.value })); }} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Alt Text</label>
              <input value={form.alt} onChange={(e) => setForm((v) => ({ ...v, alt: e.target.value }))} placeholder="Descriptive text for accessibility" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={!form.url || !form.name} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors disabled:opacity-50">
              <Upload className="w-4 h-4" /> Save Image
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">✓ Saved!</span>}
          </div>
        </div>
      )}

      {/* Section filter */}
      <div className="flex flex-wrap gap-2">
        {["All", ...SECTIONS].map((s) => (
          <button key={s} onClick={() => setFilterSection(s)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterSection === s ? "bg-[#0a1f44] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
        ))}
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-2xl">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{images.length === 0 ? "No images uploaded yet." : "No images in this section."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div key={img.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden group relative">
              <div className="h-36 overflow-hidden bg-gray-50">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">{img.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{img.section}</span>
                  {deleteConfirm === img.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(img.id)} className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold">Del</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 rounded border text-xs text-gray-500">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(img.id)} className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { logActivity, type Supporter } from "@/lib/contentStore";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, ToggleLeft, ToggleRight, GripVertical, Star } from "lucide-react";

const SUPPORTERS_KEY = 'hhi_supporters';

const SEED_SUPPORTERS: Supporter[] = [
  { id: 's1', name: 'Andrei Svechnikov', role: 'Center · Lead Ambassador', description: 'NHL All-Star and Carolina Hurricanes star Andrei Svechnikov joined as HHI Lead Ambassador in 2026, pledging $200,000 to the equipment grant fund and personally mentoring youth players across North America.', number: '#37', link: 'https://www.nhl.com/hurricanes', active: true, order: 0, isAmbassador: true },
  { id: 's2', name: 'Marcus Kowalczyk', role: 'Defenseman · Ambassador', description: 'A veteran defenseman known for his commitment to grassroots hockey, Marcus channels his league experience into youth coaching certification workshops across the Midwest.', number: '#4', active: true, order: 1 },
  { id: 's3', name: 'Tyler Oduya', role: 'Right Wing · Ambassador', description: 'Tyler advocates for greater inclusion and diversity in hockey, partnering with HHI to bring the game to underserved communities across North America.', number: '#21', active: true, order: 2 },
  { id: 's4', name: 'Viktor Petrov', role: 'Goaltender · Ambassador', description: 'Viktor credits hockey with giving him discipline and purpose. He now funds rink scholarships that give youth their first on-ice experience.', number: '#31', active: true, order: 3 },
  { id: 's5', name: 'Jenna McAllister', role: 'Forward · Girls & Women in Hockey Ambassador', description: "A pioneer in women's professional hockey, Jenna champions gender equity and leads HHI's Girls & Women in Hockey Initiative, supporting over 500 young female players annually.", number: '#18', active: true, order: 4 },
  { id: 's6', name: 'Darnell Baptiste', role: 'Center · Community Outreach Ambassador', description: 'Darnell grew up in a community with no rink access. He now funds mobile rink programs in underserved neighborhoods, reaching communities that traditional programs cannot.', number: '#9', active: true, order: 5 },
];

export function getSupporters(): Supporter[] {
  try {
    const raw = localStorage.getItem(SUPPORTERS_KEY);
    if (!raw) { localStorage.setItem(SUPPORTERS_KEY, JSON.stringify(SEED_SUPPORTERS)); return SEED_SUPPORTERS; }
    return (JSON.parse(raw) as Supporter[]).sort((a, b) => a.order - b.order);
  } catch { return SEED_SUPPORTERS; }
}

export function getActiveSupporters(): Supporter[] {
  return getSupporters().filter(s => s.active);
}

function saveAllSupporters(supporters: Supporter[]) {
  localStorage.setItem(SUPPORTERS_KEY, JSON.stringify(supporters));
}

function emptySupporter(order: number): Supporter {
  return { id: crypto.randomUUID(), name: '', role: '', description: '', number: '', active: true, order, isAmbassador: false };
}

export function SupportersSection() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() { setSupporters(getSupporters()); }
  useEffect(() => { refresh(); }, []);

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    const all = getSupporters();
    const idx = all.findIndex(s => s.id === editing.id);
    if (idx >= 0) all[idx] = editing; else all.push(editing);
    saveAllSupporters(all);
    logActivity(idx >= 0 ? 'EDIT' : 'CREATE', 'Supporters', `Supporter: "${editing.name}"`);
    setEditing(null);
    refresh();
  }

  function handleToggle(s: Supporter) {
    const all = getSupporters();
    const idx = all.findIndex(x => x.id === s.id);
    if (idx >= 0) { all[idx] = { ...s, active: !s.active }; saveAllSupporters(all); }
    logActivity('TOGGLE', 'Supporters', `${!s.active ? 'Enabled' : 'Hidden'}: "${s.name}"`);
    refresh();
  }

  function handleDelete(id: string) {
    const s = supporters.find(x => x.id === id);
    saveAllSupporters(supporters.filter(x => x.id !== id));
    logActivity('DELETE', 'Supporters', `Deleted: "${s?.name}"`);
    setDeleteConfirm(null);
    refresh();
  }

  function moveOrder(id: string, dir: 'up' | 'down') {
    const all = [...supporters];
    const idx = all.findIndex(s => s.id === id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= all.length) return;
    [all[idx].order, all[swap].order] = [all[swap].order, all[idx].order];
    saveAllSupporters(all);
    refresh();
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {supporters.some(s => s.id === editing.id) ? 'Edit Supporter' : 'Add Supporter'}
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input value={editing.name} onChange={e => setEditing(v => v && { ...v, name: e.target.value })} placeholder="e.g. Andrei Svechnikov" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role / Title</label>
              <input value={editing.role} onChange={e => setEditing(v => v && { ...v, role: e.target.value })} placeholder="e.g. Center · Lead Ambassador" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Jersey Number</label>
              <input value={editing.number ?? ''} onChange={e => setEditing(v => v && { ...v, number: e.target.value })} placeholder="#37" className={inputCls} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={editing.description} onChange={e => setEditing(v => v && { ...v, description: e.target.value })} rows={3} placeholder="Their connection to HHI and role..." className={`${inputCls} resize-none`} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Profile Image URL</label>
              <input value={editing.imageUrl ?? ''} onChange={e => setEditing(v => v && { ...v, imageUrl: e.target.value })} placeholder="https://... (leave blank to show jersey number)" className={inputCls} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">External Link (optional)</label>
              <input value={editing.link ?? ''} onChange={e => setEditing(v => v && { ...v, link: e.target.value })} placeholder="https://..." className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" min={0} value={editing.order} onChange={e => setEditing(v => v && { ...v, order: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setEditing(v => v && { ...v, active: !v.active })} className={`w-10 h-6 rounded-full transition-colors relative ${editing.active ? 'bg-[#0a1f44]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-gray-700">Visible on site</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setEditing(v => v && { ...v, isAmbassador: !v.isAmbassador })} className={`w-10 h-6 rounded-full transition-colors relative ${editing.isAmbassador ? 'bg-amber-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.isAmbassador ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-gray-700">Lead Ambassador</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
              <Save className="w-4 h-4" /> Save
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
          <h2 className="text-xl font-bold text-gray-900">Proud Supporters</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {supporters.length} supporters · {supporters.filter(s => s.active).length} visible · {supporters.filter(s => s.isAmbassador).length} lead ambassador(s)
          </p>
        </div>
        <button onClick={() => setEditing(emptySupporter(supporters.length))} className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Supporter
        </button>
      </div>

      <div className="space-y-3">
        {supporters.map((s, idx) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#0a1f44] flex items-center justify-center shrink-0 overflow-hidden">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span className="text-white font-serif font-bold text-lg">{s.number ?? s.name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900">{s.name}</p>
                {s.isAmbassador && <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold"><Star className="w-3 h-3" /> Lead Ambassador</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.active ? 'Visible' : 'Hidden'}</span>
              </div>
              <p className="text-sm text-[#a8d8ea] font-medium mt-0.5">{s.role}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.description}</p>
              {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0a1f44] underline mt-1 inline-block truncate max-w-xs">{s.link}</a>}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <button onClick={() => moveOrder(s.id, 'up')} disabled={idx === 0} className="p-1.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20"><GripVertical className="w-3.5 h-3.5 rotate-90" /></button>
                <button onClick={() => handleToggle(s)} className={`p-2 rounded-lg transition-colors ${s.active ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {s.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditing({ ...s })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                {deleteConfirm === s.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(s.id)} className="px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold">Del</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded border text-xs text-gray-500">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(s.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

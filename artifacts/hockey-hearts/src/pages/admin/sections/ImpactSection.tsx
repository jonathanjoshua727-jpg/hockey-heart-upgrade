import { useState, useEffect } from "react";
import {
  type ImpactMetric,
  logActivity,
} from "@/lib/contentStore";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, Eye, EyeOff, Target, TrendingUp } from "lucide-react";

const IMPACT_KEY = 'hhi_impact_metrics';

const SEED_METRICS: ImpactMetric[] = [
  { id: 'im1', label: 'Players Supported', target: 5000, actual: 4247, unit: 'youth', description: 'Young players who received direct program support', order: 0, published: true },
  { id: 'im2', label: 'Equipment Packages Delivered', target: 2000, actual: 1847, unit: 'packages', description: 'Full hockey gear kits distributed to youth in need', order: 1, published: true },
  { id: 'im3', label: 'Coaching Opportunities', target: 500, actual: 312, unit: 'sessions', description: 'Youth coaching certification and mentorship sessions', order: 2, published: true },
  { id: 'im4', label: 'Rink Access Opportunities', target: 150, actual: 94, unit: 'rinks', description: 'Community rinks providing subsidized youth access', order: 3, published: true },
  { id: 'im5', label: 'Educational Sessions', target: 300, actual: 187, unit: 'sessions', description: 'Academic and life-skills sessions tied to hockey programs', order: 4, published: true },
  { id: 'im6', label: 'Families Supported', target: 1200, actual: 834, unit: 'families', description: 'Families who received emergency or program support', order: 5, published: true },
  { id: 'im7', label: 'Communities Reached', target: 25, actual: 14, unit: 'communities', description: 'Distinct communities with active HHI programs', order: 6, published: true },
  { id: 'im8', label: 'Girls & Women Supported', target: 800, actual: 521, unit: 'players', description: 'Female players who participated in gender-equity programs', order: 7, published: true },
  { id: 'im9', label: 'Mobile Outreach Events', target: 200, actual: 143, unit: 'events', description: 'Mobile program events delivered to areas without rink access', order: 8, published: true },
];

export function getImpactMetrics(): ImpactMetric[] {
  try {
    const raw = localStorage.getItem(IMPACT_KEY);
    if (!raw) {
      localStorage.setItem(IMPACT_KEY, JSON.stringify(SEED_METRICS));
      return SEED_METRICS;
    }
    return (JSON.parse(raw) as ImpactMetric[]).sort((a, b) => a.order - b.order);
  } catch { return SEED_METRICS; }
}

export function getPublishedImpactMetrics(): ImpactMetric[] {
  return getImpactMetrics().filter(m => m.published);
}

function saveMetrics(metrics: ImpactMetric[]) {
  localStorage.setItem(IMPACT_KEY, JSON.stringify(metrics));
}

function emptyMetric(order: number): ImpactMetric {
  return { id: crypto.randomUUID(), label: '', target: 0, actual: 0, unit: '', description: '', order, published: true };
}

function pct(actual: number, target: number) {
  if (target === 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

export function ImpactSection() {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [editing, setEditing] = useState<ImpactMetric | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function refresh() { setMetrics(getImpactMetrics()); }
  useEffect(() => { refresh(); }, []);

  function handleSave() {
    if (!editing || !editing.label.trim()) return;
    const all = getImpactMetrics();
    const idx = all.findIndex(m => m.id === editing.id);
    if (idx >= 0) all[idx] = editing; else all.push(editing);
    saveMetrics(all);
    logActivity(idx >= 0 ? 'EDIT' : 'CREATE', 'Impact', `Impact metric: "${editing.label}"`);
    setEditing(null);
    refresh();
  }

  function handleDelete(id: string) {
    const m = metrics.find(x => x.id === id);
    saveMetrics(metrics.filter(x => x.id !== id));
    logActivity('DELETE', 'Impact', `Deleted metric: "${m?.label}"`);
    setDeleteConfirm(null);
    refresh();
  }

  function handleToggle(m: ImpactMetric) {
    const all = getImpactMetrics();
    const idx = all.findIndex(x => x.id === m.id);
    if (idx >= 0) { all[idx] = { ...m, published: !m.published }; saveMetrics(all); }
    refresh();
  }

  function updateActual(m: ImpactMetric, val: number) {
    const all = getImpactMetrics();
    const idx = all.findIndex(x => x.id === m.id);
    if (idx >= 0) { all[idx] = { ...m, actual: val }; saveMetrics(all); }
    logActivity('EDIT', 'Impact', `Updated actual for "${m.label}": ${val}`);
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
            {metrics.some(m => m.id === editing.id) ? 'Edit Impact Metric' : 'New Impact Metric'}
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Metric Label *</label>
              <input value={editing.label} onChange={e => setEditing(v => v && { ...v, label: e.target.value })} placeholder="e.g. Players Supported" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Target (Goal)</label>
              <input type="number" min={0} value={editing.target} onChange={e => setEditing(v => v && { ...v, target: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Actual (Achieved)</label>
              <input type="number" min={0} value={editing.actual} onChange={e => setEditing(v => v && { ...v, actual: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <input value={editing.unit} onChange={e => setEditing(v => v && { ...v, unit: e.target.value })} placeholder="youth, sessions, families…" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" min={0} value={editing.order} onChange={e => setEditing(v => v && { ...v, order: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input value={editing.description ?? ''} onChange={e => setEditing(v => v && { ...v, description: e.target.value })} placeholder="Short description" className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEditing(v => v && { ...v, published: !v.published })} className={`w-10 h-6 rounded-full transition-colors relative ${editing.published ? 'bg-[#0a1f44]' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.published ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-gray-700">Published on Impact page</span>
          </label>
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
          <h2 className="text-xl font-bold text-gray-900">Impact Metrics</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage program targets and actual results. Update actuals as programs deliver results.
          </p>
        </div>
        <button onClick={() => setEditing(emptyMetric(metrics.length))} className="flex items-center gap-2 bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Metric
        </button>
      </div>

      <div className="space-y-4">
        {metrics.map(m => {
          const p = pct(m.actual, m.target);
          return (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{m.label}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.published ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                  {m.description && <p className="text-gray-500 text-xs">{m.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggle(m)} className={`p-2 rounded-lg transition-colors ${m.published ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    {m.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing({ ...m })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === m.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg border text-xs text-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(m.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-gray-500"><TrendingUp className="w-3.5 h-3.5" /> Actual: <span className="font-semibold text-gray-900 ml-1">{m.actual.toLocaleString()} {m.unit}</span></span>
                    <span className="flex items-center gap-1 text-gray-400"><Target className="w-3.5 h-3.5" /> Target: <span className="font-medium ml-1">{m.target.toLocaleString()}</span></span>
                  </div>
                  <span className={`font-bold text-sm ${p >= 100 ? 'text-green-600' : p >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>{p}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all ${p >= 100 ? 'bg-green-500' : p >= 70 ? 'bg-[#a8d8ea]' : 'bg-amber-400'}`} style={{ width: `${p}%` }} />
                </div>
              </div>

              {/* Quick update actual */}
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-gray-500 shrink-0">Update actual:</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={m.actual}
                  key={m.actual}
                  onBlur={e => { const v = Number(e.target.value); if (v !== m.actual) updateActual(m, v); }}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a1f44]/20"
                />
                <span className="text-xs text-gray-400">{m.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

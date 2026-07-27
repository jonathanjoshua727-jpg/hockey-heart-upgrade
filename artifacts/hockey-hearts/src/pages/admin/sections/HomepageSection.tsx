import { useState, useEffect } from "react";
import {
  getHomepageContent,
  saveHomepageContent,
  getSiteSettings,
  saveSiteSettings,
  logActivity,
  type HomepageContent,
  type SiteSettings,
} from "@/lib/contentStore";
import { Save } from "lucide-react";

export function HomepageSection() {
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [savedHomepage, setSavedHomepage] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    setHomepage(getHomepageContent());
    setSettings(getSiteSettings());
  }, []);

  function handleSaveHomepage() {
    if (!homepage) return;
    saveHomepageContent(homepage);
    logActivity("SAVE", "Homepage", "Homepage content updated");
    setSavedHomepage(true);
    setTimeout(() => setSavedHomepage(false), 2500);
  }

  function handleSaveSettings() {
    if (!settings) return;
    saveSiteSettings(settings);
    logActivity("SAVE", "Homepage", "Site settings updated");
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  }

  function updateStat(idx: number, field: "number" | "label", val: string) {
    if (!settings) return;
    const stats = [...settings.impactStats];
    stats[idx] = { ...stats[idx], [field]: val };
    setSettings({ ...settings, impactStats: stats });
  }

  function addStat() {
    if (!settings) return;
    setSettings({ ...settings, impactStats: [...settings.impactStats, { number: "", label: "" }] });
  }

  function removeStat(idx: number) {
    if (!settings) return;
    const stats = settings.impactStats.filter((_, i) => i !== idx);
    setSettings({ ...settings, impactStats: stats });
  }

  if (!homepage || !settings) return null;

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Homepage Content</h2>
        <p className="text-gray-500 text-sm mt-1">Edit the hero, mission section, and impact stats shown on the home page.</p>
      </div>

      {/* Hero section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Hero Banner</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Hero Heading</label>
            <input value={homepage.heroHeading} onChange={(e) => setHomepage({ ...homepage, heroHeading: e.target.value })} className={inputCls} placeholder="Play. Heal. Thrive." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Hero Subheading</label>
            <textarea value={homepage.heroSubheading} onChange={(e) => setHomepage({ ...homepage, heroSubheading: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Empowering youth through..." />
          </div>
        </div>
      </div>

      {/* Mission section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Mission Section</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mission Title</label>
            <input value={homepage.missionTitle} onChange={(e) => setHomepage({ ...homepage, missionTitle: e.target.value })} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mission Body Text</label>
            <textarea value={homepage.missionText} onChange={(e) => setHomepage({ ...homepage, missionText: e.target.value })} rows={4} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSaveHomepage} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors">
          <Save className="w-4 h-4" /> Save Homepage Content
        </button>
        {savedHomepage && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>

      {/* Impact stats */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Impact Statistics</h3>
        <p className="text-sm text-gray-500">Displayed in the impact banner on the home page.</p>
        <div className="space-y-3">
          {settings.impactStats.map((stat, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 items-center">
              <input value={stat.number} onChange={(e) => updateStat(idx, "number", e.target.value)} placeholder="15k+" className={inputCls} />
              <div className="flex gap-2">
                <input value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} placeholder="Kids Reached" className={`${inputCls} flex-1`} />
                <button onClick={() => removeStat(idx)} className="px-3 rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 text-sm">✕</button>
              </div>
            </div>
          ))}
          <button onClick={addStat} className="text-sm text-[#0a1f44] font-semibold hover:underline">+ Add Stat</button>
        </div>
      </div>

      {/* Site identity */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Site Identity</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Site Name</label>
            <input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Tagline</label>
            <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputCls} placeholder="Play. Heal. Thrive." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Footer Tagline</label>
            <textarea value={settings.footerTagline} onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">EIN (Tax ID)</label>
            <input value={settings.ein} onChange={(e) => setSettings({ ...settings, ein: e.target.value })} placeholder="XX-XXXXXXX" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Meta Description</label>
            <textarea value={settings.metaDescription} onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors">
          <Save className="w-4 h-4" /> Save Site Settings
        </button>
        {savedSettings && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>
    </div>
  );
}

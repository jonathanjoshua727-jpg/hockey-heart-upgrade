import { useState, useEffect } from "react";
import { logActivity, type LegalInfo, type LegalField } from "@/lib/contentStore";
import { Save, Eye, EyeOff, ShieldAlert, Lock } from "lucide-react";

const LEGAL_KEY = 'hhi_legal_info';

const DEFAULT_LEGAL: LegalInfo = {
  organizationName: 'Hockey Heart Initiative',
  registrationStatus: { value: '', published: false },
  registrationNumber: { value: '', published: false },
  registrationJurisdiction: { value: '', published: false },
  taxStatus: { value: '', published: false },
  taxIdNumber: { value: '', published: false },
  charityStatus: { value: '', published: false },
  governmentRecognition: { value: '', published: false },
  taxDeductibility: { value: '', published: false },
  registeredAddress: { value: '', published: false },
  legalDisclosure: { value: '', published: false },
};

export function getLegalInfo(): LegalInfo {
  try {
    const raw = localStorage.getItem(LEGAL_KEY);
    return raw ? { ...DEFAULT_LEGAL, ...JSON.parse(raw) } : DEFAULT_LEGAL;
  } catch { return DEFAULT_LEGAL; }
}

export function saveLegalInfo(info: LegalInfo) {
  localStorage.setItem(LEGAL_KEY, JSON.stringify(info));
}

const FIELDS: Array<{ key: keyof Omit<LegalInfo, 'organizationName'>; label: string; placeholder: string; multiline?: boolean }> = [
  { key: 'registrationStatus', label: 'Registration Status', placeholder: 'e.g. Registered Nonprofit' },
  { key: 'registrationNumber', label: 'Registration / CAC Number', placeholder: 'e.g. RC-1234567' },
  { key: 'registrationJurisdiction', label: 'Registration Jurisdiction', placeholder: 'e.g. Delaware, USA' },
  { key: 'taxStatus', label: 'Tax Status', placeholder: 'e.g. Tax-Exempt under IRC §501(c)(3)' },
  { key: 'taxIdNumber', label: 'Tax Identification Number (EIN)', placeholder: 'e.g. 88-1234567' },
  { key: 'charityStatus', label: 'Charity Status', placeholder: 'e.g. Registered Public Charity' },
  { key: 'governmentRecognition', label: 'Government Recognition', placeholder: 'e.g. IRS determination letter issued 2024' },
  { key: 'taxDeductibility', label: 'Tax-Deductibility Statement', placeholder: 'e.g. Donations are tax-deductible to the extent permitted by law.' },
  { key: 'registeredAddress', label: 'Registered Address', placeholder: 'Legal registered address' },
  { key: 'legalDisclosure', label: 'Legal Disclosure / Disclaimer', placeholder: 'Full legal disclosure text shown publicly when published', multiline: true },
];

export function LegalSection() {
  const [info, setInfo] = useState<LegalInfo>(DEFAULT_LEGAL);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setInfo(getLegalInfo()); }, []);

  function updateField(key: keyof Omit<LegalInfo, 'organizationName'>, patch: Partial<LegalField>) {
    setInfo(v => ({ ...v, [key]: { ...v[key] as LegalField, ...patch } }));
  }

  function togglePublish(key: keyof Omit<LegalInfo, 'organizationName'>) {
    const field = info[key] as LegalField;
    if (!field.value.trim() && !field.published) return; // can't publish empty
    updateField(key, { published: !field.published });
  }

  function handleSave() {
    saveLegalInfo(info);
    logActivity('SAVE', 'Legal', 'Legal information updated');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const publishedCount = FIELDS.filter(f => (info[f.key] as LegalField).published).length;

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Legal & Registration</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage legal, registration, and tax information. Each field has an individual Published / Hidden toggle.
          Only fields marked Published will appear on the public website.
        </p>
      </div>

      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>{publishedCount} of {FIELDS.length} fields published publicly.</strong> Enter verified information only.
          Unpublished fields are saved securely but hidden from visitors until you deliberately publish them.
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <ShieldAlert className="w-4 h-4 inline mr-1.5 mb-0.5" />
        <strong>Important:</strong> Only enter verified, legally accurate information. Do not publish unverified registration numbers or tax IDs.
      </div>

      {/* Organization name */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Legal Organization Name</h3>
        <input
          value={info.organizationName}
          onChange={e => setInfo(v => ({ ...v, organizationName: e.target.value }))}
          className={inputCls}
          placeholder="Legal registered name"
        />
      </div>

      {/* Individual fields */}
      <div className="space-y-4">
        {FIELDS.map(({ key, label, placeholder, multiline }) => {
          const field = info[key] as LegalField;
          const canPublish = field.value.trim().length > 0;
          return (
            <div key={key} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                    field.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {field.published ? '● Published' : '○ Hidden'}
                  </span>
                </div>
                <button
                  onClick={() => togglePublish(key)}
                  disabled={!canPublish}
                  title={!canPublish ? 'Enter a value before publishing' : field.published ? 'Hide from public' : 'Publish publicly'}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    field.published
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {field.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {field.published ? 'Published' : 'Hidden'}
                </button>
              </div>
              {multiline ? (
                <textarea
                  value={field.value}
                  onChange={e => updateField(key, { value: e.target.value })}
                  placeholder={placeholder}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              ) : (
                <input
                  value={field.value}
                  onChange={e => updateField(key, { value: e.target.value })}
                  placeholder={placeholder}
                  className={inputCls}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Save className="w-4 h-4" /> Save Legal Information
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>
    </div>
  );
}

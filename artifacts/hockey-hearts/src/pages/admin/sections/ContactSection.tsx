import { useState, useEffect } from "react";
import {
  getContactInfo,
  saveContactInfo,
  getPaymentSettings,
  savePaymentSettings,
  logActivity,
  type ContactInfo,
  type PaymentSettings,
} from "@/lib/contentStore";
import { Save } from "lucide-react";

export function ContactSection() {
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [payments, setPayments] = useState<PaymentSettings | null>(null);
  const [savedContact, setSavedContact] = useState(false);
  const [savedBank, setSavedBank] = useState(false);

  useEffect(() => {
    setInfo(getContactInfo());
    setPayments(getPaymentSettings());
  }, []);

  function handleSaveContact() {
    if (!info) return;
    saveContactInfo(info);
    logActivity("SAVE", "Contact", "Contact information updated");
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2500);
  }

  function handleSaveBank() {
    if (!payments) return;
    savePaymentSettings(payments);
    logActivity("SAVE", "Contact", "Bank details updated");
    setSavedBank(true);
    setTimeout(() => setSavedBank(false), 2500);
  }

  if (!info || !payments) return null;

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your public contact details and bank transfer information.</p>
      </div>

      {/* Primary contact */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Email & Communication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Primary Email *</label>
            <input value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} type="email" placeholder="hockeyheartinitiative@gmail.com" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Secondary Email</label>
            <input value={info.secondaryEmail ?? ''} onChange={(e) => setInfo({ ...info, secondaryEmail: e.target.value })} type="email" placeholder="press@hockeyheartinitiative.com" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">WhatsApp</label>
            <input value={info.whatsapp ?? ''} onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })} placeholder="+1 (555) 000-0000" className={inputCls} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Website URL</label>
            <input value={info.website ?? ''} onChange={(e) => setInfo({ ...info, website: e.target.value })} placeholder="https://hockeyheartinitiative.com" className={inputCls} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Contact Page Message</label>
            <textarea value={info.contactMessage ?? ''} onChange={(e) => setInfo({ ...info, contactMessage: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Shown at the top of the contact page..." />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Address</h3>
        <p className="text-xs text-gray-500">Leave all address fields blank if you prefer not to display a physical address publicly.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Physical / Street Address</label>
            <input value={info.physicalAddress ?? ''} onChange={(e) => setInfo({ ...info, physicalAddress: e.target.value })} placeholder="123 Main Street" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input value={info.city ?? ''} onChange={(e) => setInfo({ ...info, city: e.target.value })} placeholder="Raleigh" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">State / Province</label>
            <input value={info.state ?? ''} onChange={(e) => setInfo({ ...info, state: e.target.value })} placeholder="NC" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input value={info.country ?? ''} onChange={(e) => setInfo({ ...info, country: e.target.value })} placeholder="United States" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mailing Address (if different)</label>
            <input value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} placeholder="P.O. Box or mailing address" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["facebook", "twitter", "instagram", "linkedin", "youtube"] as const).map((platform) => (
            <div key={platform} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 capitalize">{platform === 'twitter' ? 'X (Twitter)' : platform}</label>
              <input
                value={info.socialLinks[platform]}
                onChange={(e) => setInfo({ ...info, socialLinks: { ...info.socialLinks, [platform]: e.target.value } })}
                placeholder={`https://${platform === 'twitter' ? 'x' : platform}.com/hockeyheartinitiative`}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSaveContact} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors">
          <Save className="w-4 h-4" /> Save Contact Info
        </button>
        {savedContact && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>

      {/* Bank details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Bank Transfer Details</h3>
        <p className="text-sm text-gray-500">Displayed to donors who choose Bank Transfer on the donation form (shown inside the secure checkout).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Bank Name</label>
            <input value={payments.bankDetails.bankName} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, bankName: e.target.value } })} placeholder="e.g. Chase Bank" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Account Name</label>
            <input value={payments.bankDetails.accountName} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, accountName: e.target.value } })} placeholder="Hockey Heart Initiative" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Account Number</label>
            <input value={payments.bankDetails.accountNumber} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, accountNumber: e.target.value } })} placeholder="XXXXXXXXXXXX" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Routing Number (ABA)</label>
            <input value={payments.bankDetails.routingNumber} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, routingNumber: e.target.value } })} placeholder="XXXXXXXXX" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">SWIFT / BIC Code</label>
            <input value={payments.bankDetails.swiftCode} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, swiftCode: e.target.value } })} placeholder="e.g. CHASUS33" className={inputCls} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Transfer Instructions</label>
            <textarea value={payments.bankDetails.instructions} onChange={(e) => setPayments({ ...payments, bankDetails: { ...payments.bankDetails, instructions: e.target.value } })} rows={2} className={`${inputCls} resize-none`} placeholder="Include your name and email as the payment reference..." />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSaveBank} className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors">
          <Save className="w-4 h-4" /> Save Bank Details
        </button>
        {savedBank && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>
    </div>
  );
}

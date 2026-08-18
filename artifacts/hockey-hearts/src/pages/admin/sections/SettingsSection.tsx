import { useState } from "react";
import { changeAdminPassword, getAdminUsername, logoutAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/contentStore";
import { sendAdminTestEmail } from "@/lib/donationApi";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, LogOut, Mail, ShieldCheck } from "lucide-react";

export function SettingsSection() {
  const [, navigate] = useLocation();
  const username = getAdminUsername();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Test email
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await changeAdminPassword(current, next);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Failed to change password.");
      return;
    }
    logActivity("CHANGE_PASSWORD", "Settings", `Password changed for: ${username}`);
    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  async function handleSendTestEmail(e: React.FormEvent) {
    e.preventDefault();
    setTestEmailResult(null);
    setTestEmailLoading(true);
    const result = await sendAdminTestEmail(testEmailTo.trim());
    setTestEmailLoading(false);
    setTestEmailResult({
      ok: result.ok,
      message: result.ok
        ? (result.message ?? `Test email sent to ${testEmailTo}`)
        : (result.error ?? "Failed to send. Check that the domain is verified in Resend."),
    });
  }

  function handleLogout() {
    logActivity("LOGOUT", "Admin", `Admin logged out: ${username}`);
    logoutAdmin();
    navigate("/admin");
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your admin account and security.</p>
      </div>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0a1f44] text-white rounded-full flex items-center justify-center font-bold text-lg uppercase">
            {username.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{username}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          Session active · expires in ~8 hours
        </div>
      </div>

      {/* Test email delivery */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-bold text-gray-900">Test Donation Email</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Sends a sample confirmation from donations@hockeyheartinitiative.com to verify inbox delivery.
            </p>
          </div>
        </div>
        <form onSubmit={handleSendTestEmail} className="space-y-1.5">
          <label htmlFor="test-email-to" className="text-sm font-medium text-gray-700">To Email Address</label>
          <div className="flex gap-2">
          <input
            id="test-email-to"
            type="email"
            required
            placeholder="your@gmail.com"
            value={testEmailTo}
            onChange={(e) => setTestEmailTo(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
          />
          <button
            type="submit"
            disabled={testEmailLoading}
            className="bg-[#0a1f44] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a1f44]/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {testEmailLoading ? "Sending…" : "Send Test"}
          </button>
          </div>
        </form>
        {testEmailResult && (
          <div
            className={`px-4 py-3 rounded-xl text-sm ${
              testEmailResult.ok
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {testEmailResult.ok ? "✓ " : "✗ "}{testEmailResult.message}
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "Current Password", value: current, onChange: setCurrent, autoComplete: "current-password" },
            { label: "New Password", value: next, onChange: setNext, autoComplete: "new-password", hint: "Minimum 8 characters" },
            { label: "Confirm New Password", value: confirm, onChange: setConfirm, autoComplete: "new-password" },
          ].map(({ label, value, onChange, autoComplete, hint }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  autoComplete={autoComplete}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {hint && <p className="text-xs text-gray-400">{hint}</p>}
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
              ✓ Password changed successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a1f44] text-white py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Session */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <LogOut className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-900">Session</h3>
        </div>
        <p className="text-sm text-gray-500">
          Admin sessions expire automatically after 8 hours. You can end your session now.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

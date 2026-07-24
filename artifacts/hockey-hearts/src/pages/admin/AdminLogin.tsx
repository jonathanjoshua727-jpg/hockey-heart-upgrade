import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CircleDot, Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";
import { hasAdminAccount, setupAdmin, loginAdmin, isAdminLoggedIn } from "@/lib/adminAuth";
import { logActivity } from "@/lib/contentStore";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin/dashboard");
      return;
    }
    if (!hasAdminAccount()) {
      setMode("setup");
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "setup") {
        if (username.trim().length < 3) {
          setError("Username must be at least 3 characters.");
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await setupAdmin(username.trim(), password);
        logActivity("SETUP", "Admin", `Admin account created for user: ${username.trim()}`);
        navigate("/admin/dashboard");
      } else {
        const result = await loginAdmin(username, password);
        if (!result.ok) {
          setError(result.error || "Login failed.");
          return;
        }
        logActivity("LOGIN", "Admin", `Admin logged in: ${username}`);
        navigate("/admin/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1f44] to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl border border-white/20">
            <CircleDot className="w-8 h-8 text-[#a8d8ea]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Hockey Heart Initiative</h1>
            <p className="text-white/50 text-sm mt-1">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-6">
          {mode === "setup" ? (
            <>
              <div className="flex items-center gap-3 bg-[#a8d8ea]/10 border border-[#a8d8ea]/20 rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 text-[#a8d8ea] shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">First-time setup</p>
                  <p className="text-white/60 text-xs">Create your secure admin account to continue.</p>
                </div>
              </div>
              <h2 className="text-white font-serif text-xl font-bold">Create Admin Account</h2>
            </>
          ) : (
            <h2 className="text-white font-serif text-xl font-bold">Sign in to Dashboard</h2>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a8d8ea]/60 focus:ring-1 focus:ring-[#a8d8ea]/40 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "setup" ? "Min. 8 characters" : "••••••••"}
                  required
                  autoComplete={mode === "setup" ? "new-password" : "current-password"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a8d8ea]/60 focus:ring-1 focus:ring-[#a8d8ea]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (setup only) */}
            {mode === "setup" && (
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#a8d8ea]/60 focus:ring-1 focus:ring-[#a8d8ea]/40 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#a8d8ea] text-[#0a1f44] py-3.5 rounded-xl font-bold text-base hover:bg-[#a8d8ea]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait…"
                : mode === "setup"
                ? "Create Account & Enter Dashboard"
                : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs">
          Hockey Heart Initiative · Admin Portal · Secure Access
        </p>
      </div>
    </div>
  );
}

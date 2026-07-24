import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { isAdminLoggedIn, getAdminUsername, logoutAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/contentStore";
import { OverviewSection } from "./sections/OverviewSection";
import { NewsSection } from "./sections/NewsSection";
import { CampaignSection } from "./sections/CampaignSection";
import { PaymentSection } from "./sections/PaymentSection";
import { ActivitySection } from "./sections/ActivitySection";
import { SettingsSection } from "./sections/SettingsSection";
import {
  CircleDot,
  LayoutDashboard,
  FileText,
  Target,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

type Section = "overview" | "news" | "campaigns" | "payments" | "activity" | "settings";

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "news", label: "News & Updates", icon: FileText },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "payments", label: "Payments & Crypto", icon: CreditCard },
  { id: "activity", label: "Activity Log", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin");
    }
  }, [navigate]);

  if (!isAdminLoggedIn()) return null;

  const username = getAdminUsername();

  function handleLogout() {
    logActivity("LOGOUT", "Admin", `Admin logged out: ${username}`);
    logoutAdmin();
    navigate("/admin");
  }

  function renderSection() {
    switch (active) {
      case "overview": return <OverviewSection />;
      case "news": return <NewsSection />;
      case "campaigns": return <CampaignSection />;
      case "payments": return <PaymentSection />;
      case "activity": return <ActivitySection />;
      case "settings": return <SettingsSection />;
    }
  }

  function NavContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#a8d8ea] text-[#0a1f44] p-1.5 rounded-full">
              <CircleDot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-serif font-bold text-sm leading-tight">Hockey Heart</p>
              <p className="text-white/50 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActive(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            View Public Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                {username.charAt(0)}
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{username}</p>
                <p className="text-white/40 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[#0a1f44] flex-col fixed left-0 top-0 bottom-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-[#0a1f44] flex flex-col h-full z-10">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">
                {NAV_ITEMS.find((n) => n.id === active)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Site
            </Link>
            <div className="w-8 h-8 bg-[#0a1f44] text-white rounded-full flex items-center justify-center text-sm font-bold uppercase">
              {username.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

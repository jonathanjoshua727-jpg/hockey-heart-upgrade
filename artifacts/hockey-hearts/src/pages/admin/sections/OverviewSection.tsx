import { getArticles, getCampaigns, getTransactions, getActivityLog } from "@/lib/contentStore";
import { FileText, Target, DollarSign, Activity, TrendingUp, Users, Heart, Award } from "lucide-react";

export function OverviewSection() {
  const articles = getArticles();
  const campaigns = getCampaigns();
  const transactions = getTransactions();
  const log = getActivityLog();

  const published = articles.filter((a) => a.published).length;
  const active = campaigns.filter((c) => c.active).length;
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
  const progressPct = Math.round((totalRaised / totalGoal) * 100);

  const stats = [
    { label: "Published Articles", value: published, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Campaigns", value: active, icon: Target, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Raised", value: `$${totalRaised.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Activity Log Entries", value: log.length, icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const missionStats = [
    { label: "Youth Served (2025)", value: "4,200+", icon: Users },
    { label: "Equipment Donated", value: "$1.2M", icon: Award },
    { label: "States with Programs", value: "14", icon: Heart },
    { label: "Rink Partnerships", value: "47", icon: TrendingUp },
  ];

  const recentLog = log.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Summary of website content and campaign performance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fundraising progress */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Overall Fundraising Progress</h3>
          <span className="text-sm font-semibold text-emerald-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#0a1f44] to-[#a8d8ea] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>${totalRaised.toLocaleString()} raised</span>
          <span>Goal: ${totalGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Mission Impact */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Mission Impact (2025 Report)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {missionStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center space-y-2 p-3 bg-gray-50 rounded-xl">
              <Icon className="w-5 h-5 text-[#0a1f44] mx-auto" />
              <p className="text-xl font-bold text-[#0a1f44]">{value}</p>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Campaign Performance</h3>
        <div className="space-y-3">
          {campaigns.slice(0, 6).map((c) => {
            const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium truncate pr-4">{c.title}</span>
                  <span className="text-gray-500 shrink-0">${c.raised.toLocaleString()} / ${c.goal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-[#a8d8ea]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Recent Admin Activity</h3>
        {recentLog.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentLog.map((entry) => (
              <div key={entry.id} className="flex gap-3 items-start text-sm">
                <span className="shrink-0 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono">
                  {entry.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{entry.detail}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

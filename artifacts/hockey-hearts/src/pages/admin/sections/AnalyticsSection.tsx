import { getTransactions, getCampaigns, getArticles, getActivityLog } from "@/lib/contentStore";

function pct(num: number, total: number) {
  if (total === 0) return 0;
  return Math.round((num / total) * 100);
}

export function AnalyticsSection() {
  const transactions = getTransactions();
  const campaigns = getCampaigns();
  const articles = getArticles();
  const log = getActivityLog();

  const completed = transactions.filter((t) => t.status === "completed");
  const pending = transactions.filter((t) => t.status === "pending");
  const totalRaised = completed.reduce((s, t) => s + t.amount, 0);
  const avgDonation = completed.length > 0 ? Math.round(totalRaised / completed.length) : 0;
  const totalGoal = campaigns.reduce((s, c) => s + c.goal, 0);
  const totalCampaignRaised = campaigns.reduce((s, c) => s + c.raised, 0);
  const overallProgress = pct(totalCampaignRaised, totalGoal);

  // Method breakdown
  const methodMap: Record<string, number> = {};
  for (const tx of completed) {
    const m = tx.method.startsWith("crypto_") ? "Cryptocurrency" : tx.method === "bank_transfer" ? "Bank Transfer" : "Credit/Debit Card";
    methodMap[m] = (methodMap[m] ?? 0) + tx.amount;
  }

  // Cause breakdown
  const causeMap: Record<string, number> = {};
  for (const tx of completed) {
    causeMap[tx.cause] = (causeMap[tx.cause] ?? 0) + tx.amount;
  }

  // Top campaigns
  const topCampaigns = [...campaigns].sort((a, b) => b.raised - a.raised).slice(0, 5);

  // Recent activity
  const recentLog = log.slice(0, 8);

  const statCard = (label: string, value: string | number, sub?: string, color = "text-[#0a1f44]") => (
    <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Performance overview for donations, campaigns, and content.</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard("Total Raised (Confirmed)", `$${totalRaised.toLocaleString()}`, `${completed.length} donations`, "text-emerald-600")}
        {statCard("Pending Donations", pending.length, `$${pending.reduce((s, t) => s + t.amount, 0).toLocaleString()} pending`, "text-amber-600")}
        {statCard("Average Donation", `$${avgDonation.toLocaleString()}`, "of confirmed donations")}
        {statCard("Overall Campaign Progress", `${overallProgress}%`, `$${totalCampaignRaised.toLocaleString()} of $${totalGoal.toLocaleString()}`)}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard("Active Campaigns", campaigns.filter((c) => c.active).length)}
        {statCard("Published Articles", articles.filter((a) => a.published).length)}
        {statCard("Total Transactions", transactions.length)}
        {statCard("Admin Actions Logged", log.length)}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Overall Fundraising Progress</h3>
          <span className="text-sm font-semibold text-emerald-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full bg-gradient-to-r from-[#0a1f44] to-[#a8d8ea] transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>${totalCampaignRaised.toLocaleString()} raised across all campaigns</span>
          <span>Goal: ${totalGoal.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Donations by Method</h3>
          {Object.keys(methodMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">No confirmed donations yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(methodMap).sort(([, a], [, b]) => b - a).map(([method, amount]) => (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{method}</span>
                    <span className="font-semibold text-gray-900">${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#a8d8ea]" style={{ width: `${pct(amount, totalRaised)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cause breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Donations by Cause</h3>
          {Object.keys(causeMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">No confirmed donations yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(causeMap).sort(([, a], [, b]) => b - a).slice(0, 6).map(([cause, amount]) => (
                <div key={cause} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate pr-4">{cause}</span>
                    <span className="font-semibold text-gray-900 shrink-0">${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#0a1f44]/60" style={{ width: `${pct(amount, totalRaised)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign performance */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Campaign Performance</h3>
        <div className="space-y-4">
          {topCampaigns.map((c) => {
            const p = Math.min(100, Math.round((c.raised / c.goal) * 100));
            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm gap-4">
                  <span className="text-gray-700 font-medium truncate">{c.title}</span>
                  <span className="text-gray-500 shrink-0">${c.raised.toLocaleString()} / ${c.goal.toLocaleString()} ({p}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-[#a8d8ea]" style={{ width: `${p}%` }} />
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
                <span className="shrink-0 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono">{entry.action}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{entry.detail}</p>
                  <p className="text-gray-400 text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

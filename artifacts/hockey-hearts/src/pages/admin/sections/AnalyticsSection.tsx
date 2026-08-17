import { useMemo } from "react";
import { getTransactions, getCampaigns, getArticles, getActivityLog } from "@/lib/contentStore";
import { getAllClicks, getClickStats, getTopLinks, getSupporterClicks, getDonationFunnel } from "@/lib/analytics";
import { MousePointerClick, TrendingUp, BarChart3, Users, ArrowDown } from "lucide-react";

function pct(num: number, total: number) {
  if (total === 0) return 0;
  return Math.round((num / total) * 100);
}

function convPct(from: number, to: number) {
  if (from === 0) return '—';
  return `${Math.round((to / from) * 100)}%`;
}

export function AnalyticsSection() {
  const transactions = getTransactions();
  const campaigns = getCampaigns();
  const articles = getArticles();

  const clicks = useMemo(() => getAllClicks(), []);
  const clickStats = useMemo(() => getClickStats(clicks), [clicks]);
  const topLinks = useMemo(() => getTopLinks(clicks, 15), [clicks]);
  const supporterLinks = useMemo(() => getSupporterClicks(clicks), [clicks]);
  const funnel = useMemo(() => getDonationFunnel(), []);

  const completed = transactions.filter((t) => t.status === "completed");
  const pending = transactions.filter((t) => t.status === "pending");
  const totalRaised = completed.reduce((s, t) => s + t.amount, 0);
  const avgDonation = completed.length > 0 ? Math.round(totalRaised / completed.length) : 0;
  const totalGoal = campaigns.reduce((s, c) => s + c.goal, 0);
  const totalCampaignRaised = campaigns.reduce((s, c) => s + c.raised, 0);
  const overallProgress = pct(totalCampaignRaised, totalGoal);

  const methodMap: Record<string, number> = {};
  for (const tx of completed) {
    const m = tx.method.startsWith("crypto_") ? "Cryptocurrency" : tx.method === "bank_transfer" ? "Bank Transfer" : "Credit/Debit Card";
    methodMap[m] = (methodMap[m] ?? 0) + tx.amount;
  }

  const causeMap: Record<string, number> = {};
  for (const tx of completed) {
    causeMap[tx.cause] = (causeMap[tx.cause] ?? 0) + tx.amount;
  }

  const currencyMap: Record<string, number> = {};
  for (const tx of completed) {
    currencyMap[tx.currency || "USD"] = (currencyMap[tx.currency || "USD"] ?? 0) + tx.amount;
  }

  const topCampaigns = [...campaigns].sort((a, b) => b.raised - a.raised).slice(0, 5);
  const recentLog = getActivityLog().slice(0, 6);

  const TYPE_LABEL: Record<string, string> = {
    donate_button: 'Donate Button',
    campaign: 'Campaign',
    program: 'Program',
    news: 'News',
    supporter: 'Supporter',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    cta: 'CTA',
    nav: 'Navigation',
    external: 'External Link',
    donation_page_visit: 'Donation Page',
    checkout_start: 'Checkout',
    donation_success: 'Completed Donation',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Link clicks, donation funnel, and fundraising performance.</p>
      </div>

      {/* Link click overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-[#0a1f44]" />
          <h3 className="font-bold text-gray-900">Link Click Analytics</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Clicks', value: clickStats.total },
            { label: 'Today', value: clickStats.today },
            { label: 'This Week', value: clickStats.thisWeek },
            { label: 'This Month', value: clickStats.thisMonth },
            { label: 'This Year', value: clickStats.thisYear },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-[#0a1f44]">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Donation funnel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-[#0a1f44]" />
          <h3 className="font-bold text-gray-900">Donation Funnel</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
          {[
            { label: 'Donation Page Visits', count: funnel.pageVisit, note: '' },
            { label: 'Donate Button Clicks', count: funnel.btnClick, note: funnel.pageVisit > 0 ? `${convPct(funnel.pageVisit, funnel.btnClick)} of visitors` : '' },
            { label: 'Checkout Started', count: funnel.checkoutStart, note: funnel.btnClick > 0 ? `${convPct(funnel.btnClick, funnel.checkoutStart)} of clicks` : '' },
            { label: 'Successful Donations', count: funnel.success, note: funnel.checkoutStart > 0 ? `${convPct(funnel.checkoutStart, funnel.success)} conversion` : '' },
          ].map(({ label, count, note }, idx) => {
            const maxCount = Math.max(funnel.pageVisit, funnel.btnClick, funnel.checkoutStart, funnel.success, 1);
            const w = Math.max(4, Math.round((count / maxCount) * 100));
            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{idx + 1}. {label}</span>
                  <div className="flex items-center gap-3">
                    {note && <span className="text-gray-400 text-xs">{note}</span>}
                    <span className="font-bold text-gray-900 tabular-nums">{count.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-[#0a1f44] to-[#a8d8ea] transition-all" style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
          {funnel.failed > 0 && (
            <p className="text-xs text-red-500 pt-1">⚠ {funnel.failed} failed payment attempt{funnel.failed !== 1 ? 's' : ''}</p>
          )}
          {funnel.pageVisit === 0 && funnel.btnClick === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-2">No donation funnel data yet. Clicks will appear here once visitors interact with the public site.</p>
          )}
        </div>
      </div>

      {/* Top clicked links */}
      {topLinks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0a1f44]" />
            <h3 className="font-bold text-gray-900">Top Clicked Links</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Link</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Today</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Week</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topLinks.map((link) => (
                  <tr key={link.label + link.destination} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">{link.label}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-[#a8d8ea]/20 text-[#0a1f44] px-2 py-0.5 rounded-full font-semibold">
                        {TYPE_LABEL[link.type] ?? link.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.todayCount}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.weekCount}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.monthCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900 tabular-nums">{link.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supporter/ambassador links */}
      {supporterLinks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0a1f44]" />
            <h3 className="font-bold text-gray-900">Supporter & Ambassador Link Engagement</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Supporter</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Today</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">This Week</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">This Month</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {supporterLinks.map((link) => (
                  <tr key={link.label} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{link.label}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.todayCount}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.weekCount}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{link.monthCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900 tabular-nums">{link.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {topLinks.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No click data yet</p>
          <p className="text-sm mt-1">Link analytics will appear here once visitors interact with the public site. Admin sessions are not counted.</p>
        </div>
      )}

      {/* Fundraising stats */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">Fundraising Performance</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Raised (Confirmed)", value: `$${totalRaised.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Donations", value: pending.length, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Average Donation", value: `$${avgDonation.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Campaign Progress", value: `${overallProgress}%`, color: "text-[#0a1f44]", bg: "bg-[#a8d8ea]/10" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
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
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{method}</span>
                    <span className="font-semibold">${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#a8d8ea]" style={{ width: `${pct(amount, totalRaised)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Program / designation breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Donations by Program</h3>
          {Object.keys(causeMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">No confirmed donations yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(causeMap).sort(([, a], [, b]) => b - a).map(([cause, amount]) => (
                <div key={cause} className="space-y-1">
                  <div className="flex justify-between text-sm gap-2">
                    <span className="text-gray-700 truncate">{cause}</span>
                    <span className="font-semibold shrink-0">${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#0a1f44]/70" style={{ width: `${pct(amount, totalRaised)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currency breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Donations by Currency</h3>
          {Object.keys(currencyMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">No confirmed donations yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(currencyMap).sort(([, a], [, b]) => b - a).map(([cur, amount]) => (
                <div key={cur} className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{cur}</span>
                  <span className="font-semibold">{amount.toLocaleString()} {cur}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign performance */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Campaign Performance</h3>
          <div className="space-y-3">
            {topCampaigns.map((c) => {
              const p = Math.min(100, Math.round((c.raised / c.goal) * 100));
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-sm gap-2">
                    <span className="text-gray-700 font-medium truncate">{c.title}</span>
                    <span className="text-gray-500 shrink-0">{p}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#0a1f44]/60" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent admin activity */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Recent Admin Activity</h3>
        {recentLog.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No activity recorded.</p>
        ) : (
          <div className="space-y-3">
            {recentLog.map((entry) => (
              <div key={entry.id} className="flex gap-3 text-sm">
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

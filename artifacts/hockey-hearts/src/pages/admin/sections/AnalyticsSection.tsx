import { useMemo, useState, useEffect } from "react";
import { getTransactions, getCampaigns, getArticles, getActivityLog } from "@/lib/contentStore";
import { fetchDonationStats, type DonationStats } from "@/lib/donationApi";
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

  // Verified donation stats come from the payment backend; localStorage
  // transactions only cover manually recorded crypto donations.
  const [stats, setStats] = useState<DonationStats | null>(null);
  useEffect(() => {
    fetchDonationStats().then(setStats).catch(() => setStats(null));
  }, []);

  const localCrypto = transactions.filter((t) => t.method.startsWith("crypto_"));
  const completed = localCrypto.filter((t) => t.status === "completed");
  const pending = localCrypto.filter((t) => t.status === "pending");
  const completedCount = completed.length + (stats?.counts.successful ?? 0);
  const totalRaised =
    completed.reduce((s, t) => s + t.amount, 0) + (stats?.totalRaised ?? 0);
  const avgDonation = completedCount > 0 ? Math.round(totalRaised / completedCount) : 0;
  const totalGoal = campaigns.reduce((s, c) => s + c.goal, 0);
  const totalCampaignRaised = campaigns.reduce((s, c) => s + c.raised, 0);
  const overallProgress = pct(totalCampaignRaised, totalGoal);

  const methodMap: Record<string, number> = {};
  for (const tx of completed) {
    methodMap["Cryptocurrency"] = (methodMap["Cryptocurrency"] ?? 0) + tx.amount;
  }
  for (const m of stats?.byMethod ?? []) {
    const label = m.method === "bank_transfer" ? "Bank Transfer" : m.method === "card" ? "Credit/Debit Card" : m.method;
    methodMap[label] = (methodMap[label] ?? 0) + m.total;
  }

  const causeMap: Record<string, number> = {};
  for (const tx of completed) {
    causeMap[tx.cause] = (causeMap[tx.cause] ?? 0) + tx.amount;
  }
  for (const c of stats?.byCause ?? []) {
    causeMap[c.causeLabel] = (causeMap[c.causeLabel] ?? 0) + c.total;
  }

  const currencyMap: Record<string, number> = {};
  for (const tx of completed) {
    currencyMap[tx.currency || "USD"] = (currencyMap[tx.currency || "USD"] ?? 0) + tx.amount;
  }
  for (const c of stats?.byCurrency ?? []) {
    currencyMap[c.currency] = (currencyMap[c.currency] ?? 0) + c.total;
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
    </div>
  );
}
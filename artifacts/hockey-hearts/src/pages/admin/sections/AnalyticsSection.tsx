import { useMemo, useState, useEffect } from "react";
import {
  getTransactions,
  getCampaigns,
  getActivityLog,
} from "@/lib/contentStore";
import {
  fetchDonationStats,
  type DonationStats,
} from "@/lib/donationApi";
import {
  getAllClicks,
  getClickStats,
  getTopLinks,
  getSupporterClicks,
  getDonationFunnel,
} from "@/lib/analytics";
import {
  MousePointerClick,
  TrendingUp,
  BarChart3,
  Users,
  ArrowDown,
} from "lucide-react";

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function pct(num: number, total: number): number {
  if (
    !Number.isFinite(num) ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((num / total) * 100)),
  );
}

function convPct(from: number, to: number): string {
  if (!Number.isFinite(from) || from <= 0) return "—";
  if (!Number.isFinite(to)) return "0%";

  return `${Math.round((to / from) * 100)}%`;
}

const EMPTY_DONATION_STATS: DonationStats = {
  totalRaised: 0,
  counts: {
    successful: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
  },
  byCause: [],
  byMethod: [],
  byCurrency: [],
};

function normalizeDonationStats(
  data: unknown,
): DonationStats {
  const value =
    data && typeof data === "object"
      ? (data as Partial<DonationStats>)
      : {};

  const rawCounts =
    value.counts &&
    typeof value.counts === "object"
      ? value.counts
      : {};

  return {
    totalRaised: safeNumber(value.totalRaised),

    counts: {
      successful: safeNumber(
        (rawCounts as Partial<DonationStats["counts"]>)
          .successful,
      ),
      pending: safeNumber(
        (rawCounts as Partial<DonationStats["counts"]>)
          .pending,
      ),
      failed: safeNumber(
        (rawCounts as Partial<DonationStats["counts"]>)
          .failed,
      ),
      cancelled: safeNumber(
        (rawCounts as Partial<DonationStats["counts"]>)
          .cancelled,
      ),
      refunded: safeNumber(
        (rawCounts as Partial<DonationStats["counts"]>)
          .refunded,
      ),
    },

    byCause: Array.isArray(value.byCause)
      ? value.byCause
      : [],

    byMethod: Array.isArray(value.byMethod)
      ? value.byMethod
      : [],

    byCurrency: Array.isArray(value.byCurrency)
      ? value.byCurrency
      : [],
  };
}

export function AnalyticsSection() {
  const [stats, setStats] = useState<DonationStats>(
    EMPTY_DONATION_STATS,
  );

  const [statsLoading, setStatsLoading] = useState(true);

  const [statsError, setStatsError] =
    useState<string | null>(null);

  const transactions = useMemo(() => {
    try {
      const value = getTransactions();
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load transactions",
        error,
      );
      return [];
    }
  }, []);

  const campaigns = useMemo(() => {
    try {
      const value = getCampaigns();
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load campaigns",
        error,
      );
      return [];
    }
  }, []);

  const clicks = useMemo(() => {
    try {
      const value = getAllClicks();
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load click data",
        error,
      );
      return [];
    }
  }, []);

  const clickStats = useMemo(() => {
    try {
      const value = getClickStats(clicks);

      return {
        total: safeNumber(value?.total),
        today: safeNumber(value?.today),
        thisWeek: safeNumber(value?.thisWeek),
        thisMonth: safeNumber(value?.thisMonth),
        thisYear: safeNumber(value?.thisYear),
      };
    } catch (error) {
      console.error(
        "Analytics: failed to calculate click statistics",
        error,
      );

      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
      };
    }
  }, [clicks]);

  const topLinks = useMemo(() => {
    try {
      const value = getTopLinks(clicks, 15);
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load top links",
        error,
      );
      return [];
    }
  }, [clicks]);

  const supporterLinks = useMemo(() => {
    try {
      const value = getSupporterClicks(clicks);
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load supporter links",
        error,
      );
      return [];
    }
  }, [clicks]);

  const funnel = useMemo(() => {
    try {
      const value = getDonationFunnel();

      return {
        pageVisit: safeNumber(value?.pageVisit),
        btnClick: safeNumber(value?.btnClick),
        checkoutStart: safeNumber(value?.checkoutStart),
        success: safeNumber(value?.success),
        failed: safeNumber(value?.failed),
      };
    } catch (error) {
      console.error(
        "Analytics: failed to load donation funnel",
        error,
      );

      return {
        pageVisit: 0,
        btnClick: 0,
        checkoutStart: 0,
        success: 0,
        failed: 0,
      };
    }
  }, []);

  const recentLog = useMemo(() => {
    try {
      const value = getActivityLog();

      return Array.isArray(value)
        ? value.slice(0, 6)
        : [];
    } catch (error) {
      console.error(
        "Analytics: failed to load activity log",
        error,
      );
      return [];
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDonationStats() {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const data = await fetchDonationStats();

        if (!mounted) return;

        setStats(normalizeDonationStats(data));
      } catch (error) {
        console.error(
          "Analytics: failed to load donation statistics",
          error,
        );

        if (!mounted) return;

        setStats(EMPTY_DONATION_STATS);

        setStatsError(
          "Verified donation statistics could not be loaded. Other analytics remain available.",
        );
      } finally {
        if (mounted) {
          setStatsLoading(false);
        }
      }
    }

    loadDonationStats();

    return () => {
      mounted = false;
    };
  }, []);

  const localCrypto = transactions.filter(
    (transaction) =>
      typeof transaction?.method === "string" &&
      transaction.method.startsWith("crypto_"),
  );

  const completed = localCrypto.filter(
    (transaction) =>
      transaction?.status === "completed",
  );

  const pending = localCrypto.filter(
    (transaction) =>
      transaction?.status === "pending",
  );

  const successfulOnlineDonations = safeNumber(
    stats?.counts?.successful,
  );

  const verifiedRaised = safeNumber(
    stats?.totalRaised,
  );

  const completedCount =
    completed.length +
    successfulOnlineDonations;

  const totalRaised =
    completed.reduce(
      (sum, transaction) =>
        sum + safeNumber(transaction?.amount),
      0,
    ) + verifiedRaised;

  const avgDonation =
    completedCount > 0
      ? Math.round(
          totalRaised / completedCount,
        )
      : 0;

  const totalGoal = campaigns.reduce(
    (sum, campaign) =>
      sum + safeNumber(campaign?.goal),
    0,
  );

  const totalCampaignRaised =
    campaigns.reduce(
      (sum, campaign) =>
        sum + safeNumber(campaign?.raised),
      0,
    );

  const overallProgress = pct(
    totalCampaignRaised,
    totalGoal,
  );

  const methodMap: Record<string, number> = {};

  for (const transaction of completed) {
    methodMap["Cryptocurrency"] =
      (methodMap["Cryptocurrency"] ?? 0) +
      safeNumber(transaction?.amount);
  }

  for (const method of stats?.byMethod ?? []) {
    const methodName =
      typeof method?.method === "string"
        ? method.method
        : "Other";

    const label =
      methodName === "bank_transfer"
        ? "Bank Transfer"
        : methodName === "card"
          ? "Credit/Debit Card"
          : methodName;

    methodMap[label] =
      (methodMap[label] ?? 0) +
      safeNumber(method?.total);
  }

  const causeMap: Record<string, number> = {};

  for (const transaction of completed) {
    const cause =
      typeof transaction?.cause === "string" &&
      transaction.cause.trim()
        ? transaction.cause
        : "Unspecified";

    causeMap[cause] =
      (causeMap[cause] ?? 0) +
      safeNumber(transaction?.amount);
  }

  for (const cause of stats?.byCause ?? []) {
    const label =
      typeof cause?.causeLabel === "string" &&
      cause.causeLabel.trim()
        ? cause.causeLabel
        : "Unspecified";

    causeMap[label] =
      (causeMap[label] ?? 0) +
      safeNumber(cause?.total);
  }

  const currencyMap: Record<string, number> = {};

  for (const transaction of completed) {
    const currency =
      typeof transaction?.currency === "string" &&
      transaction.currency.trim()
        ? transaction.currency
        : "USD";

    currencyMap[currency] =
      (currencyMap[currency] ?? 0) +
      safeNumber(transaction?.amount);
  }

  for (const currency of stats?.byCurrency ?? []) {
    const code =
      typeof currency?.currency === "string" &&
      currency.currency.trim()
        ? currency.currency
        : "USD";

    currencyMap[code] =
      (currencyMap[code] ?? 0) +
      safeNumber(currency?.total);
  }

  const topCampaigns = [...campaigns]
    .sort(
      (a, b) =>
        safeNumber(b?.raised) -
        safeNumber(a?.raised),
    )
    .slice(0, 5);

  const TYPE_LABEL: Record<string, string> = {
    donate_button: "Donate Button",
    campaign: "Campaign",
    program: "Program",
    news: "News",
    supporter: "Supporter",
    email: "Email",
    cta: "CTA",
    nav: "Navigation",
    external: "External Link",
    donation_page_visit: "Donation Page",
    checkout_start: "Checkout",
    donation_success: "Completed Donation",
  };

  const maxFunnelCount = Math.max(
    funnel.pageVisit,
    funnel.btnClick,
    funnel.checkoutStart,
    funnel.success,
    1,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Analytics
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Link clicks, donation funnel, and fundraising performance.
        </p>
      </div>

      {statsLoading && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          Loading verified donation statistics...
        </div>
      )}

      {statsError && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
          {statsError}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-[#0a1f44]" />

          <h3 className="font-bold text-gray-900">
            Link Click Analytics
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Total Clicks",
              value: clickStats.total,
            },
            {
              label: "Today",
              value: clickStats.today,
            },
            {
              label: "This Week",
              value: clickStats.thisWeek,
            },
            {
              label: "This Month",
              value: clickStats.thisMonth,
            },
            {
              label: "This Year",
              value: clickStats.thisYear,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-[#0a1f44]">
                {value.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-[#0a1f44]" />

          <h3 className="font-bold text-gray-900">
            Donation Funnel
          </h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
          {[
            {
              label: "Donation Page Visits",
              count: funnel.pageVisit,
              note: "",
            },
            {
              label: "Donate Button Clicks",
              count: funnel.btnClick,
              note:
                funnel.pageVisit > 0
                  ? `${convPct(
                      funnel.pageVisit,
                      funnel.btnClick,
                    )} of visitors`
                  : "",
            },
            {
              label: "Checkout Started",
              count: funnel.checkoutStart,
              note:
                funnel.btnClick > 0
                  ? `${convPct(
                      funnel.btnClick,
                      funnel.checkoutStart,
                    )} of clicks`
                  : "",
            },
            {
              label: "Successful Donations",
              count: funnel.success,
              note:
                funnel.checkoutStart > 0
                  ? `${convPct(
                      funnel.checkoutStart,
                      funnel.success,
                    )} conversion`
                  : "",
            },
          ].map(
            ({ label, count, note }, index) => {
              const width = Math.max(
                4,
                Math.round(
                  (count / maxFunnelCount) *
                    100,
                ),
              );

              return (
                <div
                  key={label}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {index + 1}. {label}
                    </span>

                    <div className="flex items-center gap-3">
                      {note && (
                        <span className="text-gray-400 text-xs">
                          {note}
                        </span>
                      )}

                      <span className="font-bold text-gray-900 tabular-nums">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#0a1f44] to-[#a8d8ea] transition-all"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}

          {funnel.failed > 0 && (
            <p className="text-xs text-red-500 pt-1">
              ⚠ {funnel.failed} failed payment attempt
              {funnel.failed !== 1 ? "s" : ""}
            </p>
          )}

          {funnel.pageVisit === 0 &&
            funnel.btnClick === 0 && (
              <p className="text-gray-400 text-sm italic text-center py-2">
                No donation funnel data yet. Clicks will
                appear here once visitors interact with the
                public site.
              </p>
            )}
        </div>
      </div>

      {topLinks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0a1f44]" />

            <h3 className="font-bold text-gray-900">
              Top Clicked Links
            </h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Link
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Today
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Week
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Month
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {topLinks.map((link) => (
                  <tr
                    key={`${link.label}-${link.destination}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {link.label}
                    </td>

                    <td className="px-5 py-3">
                      <span className="text-xs bg-[#a8d8ea]/20 text-[#0a1f44] px-2 py-0.5 rounded-full font-semibold">
                        {TYPE_LABEL[link.type] ??
                          link.type}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.todayCount,
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.weekCount,
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.monthCount,
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right font-bold text-gray-900 tabular-nums">
                      {safeNumber(
                        link.count,
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {supporterLinks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0a1f44]" />

            <h3 className="font-bold text-gray-900">
              Supporter & Ambassador Link Engagement
            </h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Supporter
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Today
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    This Week
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    This Month
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {supporterLinks.map((link) => (
                  <tr
                    key={link.label}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {link.label}
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.todayCount,
                      )}
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.weekCount,
                      )}
                    </td>

                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {safeNumber(
                        link.monthCount,
                      )}
                    </td>

                    <td className="px-5 py-3 text-right font-bold text-gray-900 tabular-nums">
                      {safeNumber(
                        link.count,
                      )}
                    </td>
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

          <p className="font-medium">
            No click data yet
          </p>

          <p className="text-sm mt-1">
            Link analytics will appear here once visitors
            interact with the public site. Admin sessions
            are not counted.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">
          Fundraising Performance
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Raised (Confirmed)",
              value: `$${totalRaised.toLocaleString()}`,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Pending Donations",
              value: pending.length,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Average Donation",
              value: `$${avgDonation.toLocaleString()}`,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Campaign Progress",
              value: `${overallProgress}%`,
              color: "text-[#0a1f44]",
              bg: "bg-[#a8d8ea]/10",
            },
          ].map(
            ({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} rounded-2xl p-5`}
              >
                <p
                  className={`text-2xl font-bold ${color}`}
                >
                  {value}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {label}
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">
            Donations by Method
          </h3>

          {Object.keys(methodMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No confirmed donations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(methodMap)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => (
                  <div
                    key={method}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {method}
                      </span>

                      <span className="font-semibold">
                        ${amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#a8d8ea]"
                        style={{
                          width: `${pct(
                            amount,
                            totalRaised,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">
            Donations by Program
          </h3>

          {Object.keys(causeMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No confirmed donations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(causeMap)
                .sort(([, a], [, b]) => b - a)
                .map(([cause, amount]) => (
                  <div
                    key={cause}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-gray-700 truncate">
                        {cause}
                      </span>

                      <span className="font-semibold shrink-0">
                        ${amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#0a1f44]/70"
                        style={{
                          width: `${pct(
                            amount,
                            totalRaised,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">
            Donations by Currency
          </h3>

          {Object.keys(currencyMap).length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No confirmed donations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(currencyMap)
                .sort(([, a], [, b]) => b - a)
                .map(
                  ([currency, amount]) => (
                    <div
                      key={currency}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-700 font-medium">
                        {currency}
                      </span>

                      <span className="font-semibold">
                        {amount.toLocaleString()}{" "}
                        {currency}
                      </span>
                    </div>
                  ),
                )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">
            Campaign Performance
          </h3>

          {topCampaigns.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No campaign data available.
            </p>
          ) : (
            <div className="space-y-3">
              {topCampaigns.map((campaign) => {
                const goal = safeNumber(
                  campaign?.goal,
                );

                const raised = safeNumber(
                  campaign?.raised,
                );

                const progress =
                  goal > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(
                            (raised / goal) *
                              100,
                          ),
                        ),
                      )
                    : 0;

                return (
                  <div
                    key={campaign.id}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-gray-700 font-medium truncate">
                        {campaign.title}
                      </span>

                      <span className="text-gray-500 shrink-0">
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#0a1f44]/60"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">
          Recent Admin Activity
        </h3>

        {recentLog.length === 0 ? (
          <p className="text-gray-400 text-sm italic">
            No activity recorded.
          </p>
        ) : (
          <div className="space-y-3">
            {recentLog.map((entry) => (
              <div
                key={entry.id}
                className="flex gap-3 text-sm"
              >
                <span className="shrink-0 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono">
                  {entry.action}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">
                    {entry.detail}
                  </p>

                  <p className="text-gray-400 text-xs">
                    {new Date(
                      entry.timestamp,
                    ).toLocaleString()}
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
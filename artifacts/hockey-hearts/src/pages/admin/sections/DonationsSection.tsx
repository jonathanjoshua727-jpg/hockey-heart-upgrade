import { useState, useEffect, useCallback } from "react";
import {
  getTransactions,
  updateTransactionStatus,
  deleteTransaction,
  type Transaction,
} from "@/lib/contentStore";
import { fetchAdminDonations, type ServerDonation } from "@/lib/donationApi";
import { CheckCircle2, Clock, XCircle, Trash2, RefreshCw, ShieldCheck } from "lucide-react";

const STATUS_STYLES: Record<Transaction["status"], string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-blue-100 text-blue-700",
};
const STATUS_ICONS: Record<Transaction["status"], React.ElementType> = {
  completed: CheckCircle2,
  pending: Clock,
  failed: XCircle,
  cancelled: XCircle,
  refunded: RefreshCw,
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  card: "Credit / Debit Card",
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  usdtTrc20: "USDT (TRC20)",
  usdtErc20: "USDT (ERC20)",
  solana: "Solana",
};

function methodLabel(m: string): string {
  if (m.startsWith("crypto_")) {
    const coin = m.replace("crypto_", "");
    return `Crypto — ${METHOD_LABELS[coin] ?? coin}`;
  }
  return METHOD_LABELS[m] ?? m;
}

/** Unified row: verified server donations + locally recorded crypto donations. */
interface Row {
  key: string;
  source: "server" | "local";
  localId?: string;
  reference: string;
  amount: number;
  status: Transaction["status"];
  donorName: string;
  donorEmail: string;
  cause: string;
  method: string;
  date: string;
}

function serverStatusToRow(s: ServerDonation["status"]): Transaction["status"] {
  return s === "successful" ? "completed" : s;
}

export function DonationsSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | Transaction["status"]>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState("");

  const refresh = useCallback(async () => {
    // Locally recorded transactions (crypto donations are manual/off-gateway).
    const local: Row[] = getTransactions()
      .filter((t) => t.method.startsWith("crypto_"))
      .map((t) => ({
        key: `local-${t.id}`,
        source: "local" as const,
        localId: t.id,
        reference: t.reference,
        amount: t.amount,
        status: t.status,
        donorName: t.donorName,
        donorEmail: t.donorEmail,
        cause: t.cause,
        method: t.method,
        date: t.date,
      }));

    let server: Row[] = [];
    try {
      const { donations } = await fetchAdminDonations();
      server = donations.map((d) => ({
        key: `server-${d.id}`,
        source: "server" as const,
        reference: d.reference,
        amount: d.amount,
        status: serverStatusToRow(d.status),
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        cause: d.causeLabel,
        method: d.method,
        date: d.date,
      }));
      setApiError("");
    } catch (e) {
      setApiError(
        e instanceof Error && e.message.includes("401")
          ? "Backend session expired — log out and log back in to load verified donations."
          : "Couldn't load verified donations from the server.",
      );
    }

    setRows(
      [...server, ...local].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    );
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const totalRaised = rows
    .filter((t) => t.status === "completed" && t.source === "server")
    .reduce((sum, t) => sum + t.amount, 0);

  const pending = rows.filter((t) => t.status === "pending").length;
  const completed = rows.filter((t) => t.status === "completed").length;

  const filtered = rows
    .filter((t) => filter === "all" || t.status === filter)
    .filter(
      (t) =>
        !search ||
        t.donorName.toLowerCase().includes(search.toLowerCase()) ||
        t.donorEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.cause.toLowerCase().includes(search.toLowerCase()) ||
        t.reference.toLowerCase().includes(search.toLowerCase())
    );

  function markStatus(id: string, status: Transaction["status"]) {
    updateTransactionStatus(id, status);
    refresh();
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setDeleteConfirm(null);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Donations</h2>
        <p className="text-gray-500 text-sm mt-1">
          Verified donations from the payment backend, plus manually recorded crypto donations.
        </p>
      </div>

      {apiError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
          {apiError}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Raised (Verified)", value: `$${totalRaised.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "All Transactions", value: rows.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Confirmed", value: completed, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: pending, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donor, email, cause, ref…"
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
        />
        {(["all", "pending", "completed", "failed", "cancelled", "refunded"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === s
                ? "bg-[#0a1f44] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button onClick={refresh} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-2xl">
          {rows.length === 0 ? "No donations recorded yet." : "No results match your filter."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Donor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cause</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((tx) => {
                  const StatusIcon = STATUS_ICONS[tx.status];
                  return (
                    <tr key={tx.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          {tx.donorName}
                          {tx.source === "server" && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-label="Verified by payment backend" />
                          )}
                        </p>
                        <p className="text-gray-400 text-xs">{tx.donorEmail}</p>
                        <p className="text-gray-300 text-xs font-mono">{tx.reference}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-[140px] truncate">{tx.cause}</td>
                      <td className="px-5 py-4 text-gray-600">{methodLabel(tx.method)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[tx.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(tx.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {tx.source === "local" && tx.localId ? (
                          <div className="flex items-center gap-1">
                            {tx.status === "pending" && (
                              <button
                                onClick={() => markStatus(tx.localId!, "completed")}
                                title="Mark completed"
                                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {tx.status === "pending" && (
                              <button
                                onClick={() => markStatus(tx.localId!, "failed")}
                                title="Mark failed"
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            {deleteConfirm === tx.localId ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(tx.localId!)}
                                  className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(tx.localId!)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 uppercase tracking-wide">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

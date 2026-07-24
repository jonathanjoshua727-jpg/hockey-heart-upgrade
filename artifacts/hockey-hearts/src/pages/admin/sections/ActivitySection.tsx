import { useState, useEffect } from "react";
import { getActivityLog, type ActivityLogEntry } from "@/lib/contentStore";
import { Activity, Trash2 } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  EDIT: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  TOGGLE: "bg-purple-100 text-purple-700",
  LOGIN: "bg-[#a8d8ea]/20 text-[#0a1f44]",
  SETUP: "bg-amber-100 text-amber-700",
  SAVE: "bg-gray-100 text-gray-700",
  PIN: "bg-amber-100 text-amber-700",
  DEFAULT: "bg-gray-100 text-gray-600",
};

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? ACTION_COLORS.DEFAULT;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{action}</span>
  );
}

export function ActivitySection() {
  const [log, setLog] = useState<ActivityLogEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  function refresh() {
    setLog(getActivityLog());
  }

  useEffect(() => {
    refresh();
  }, []);

  function clearLog() {
    localStorage.removeItem("hhi_activity_log");
    setConfirmClear(false);
    setLog([]);
  }

  const filtered = log.filter(
    (e) =>
      e.action.toLowerCase().includes(filter.toLowerCase()) ||
      e.section.toLowerCase().includes(filter.toLowerCase()) ||
      e.detail.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Activity Log</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {log.length} entries recorded · last 200 kept
          </p>
        </div>
        {confirmClear ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Clear all entries?</span>
            <button
              onClick={clearLog}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear Log
          </button>
        )}
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by action, section, or detail…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
      />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
            <Activity className="w-10 h-10 opacity-30" />
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((entry, i) => (
              <div key={entry.id} className={`flex gap-4 px-5 py-4 text-sm ${i === 0 ? "" : ""}`}>
                <span className="text-gray-300 text-xs font-mono w-4 shrink-0 mt-0.5">
                  {filtered.length - i}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionBadge action={entry.action} />
                    <span className="text-xs text-gray-500 font-medium">{entry.section}</span>
                  </div>
                  <p className="text-gray-700 leading-snug">{entry.detail}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * HHI Link-Click Analytics
 * Stores anonymous click events in localStorage.
 * Does NOT track admin sessions.
 * Does NOT collect personal information.
 */

import type { LinkClick } from './contentStore';

const CLICK_KEY = 'hhi_link_clicks';
const SESSION_KEY = 'hhi_session_id';
const MAX_CLICKS = 10000;

// ── Session ID (per browser session, not per page load) ───────────────────
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── Admin detection ───────────────────────────────────────────────────────
function isAdminSession(): boolean {
  try {
    const session = sessionStorage.getItem('hhi_admin_session');
    if (!session) return false;
    const parsed = JSON.parse(session);
    return parsed?.authenticated === true;
  } catch {
    return false;
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────
function readClicks(): LinkClick[] {
  try {
    const raw = localStorage.getItem(CLICK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeClicks(clicks: LinkClick[]) {
  localStorage.setItem(CLICK_KEY, JSON.stringify(clicks));
}

// ── Track a click ─────────────────────────────────────────────────────────
export function trackClick(
  label: string,
  type: string,
  destination: string,
  page?: string
) {
  if (isAdminSession()) return; // never count admin testing
  const click: LinkClick = {
    id: crypto.randomUUID(),
    label,
    type,
    destination,
    page: page ?? window.location.pathname,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };
  const existing = readClicks();
  existing.unshift(click);
  writeClicks(existing.slice(0, MAX_CLICKS));
}

// ── Query helpers ─────────────────────────────────────────────────────────
export function getAllClicks(): LinkClick[] {
  return readClicks();
}

function startOf(unit: 'day' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  const d = new Date(now);
  if (unit === 'day') { d.setHours(0, 0, 0, 0); }
  else if (unit === 'week') { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); }
  else if (unit === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0); }
  else if (unit === 'year') { d.setMonth(0, 1); d.setHours(0, 0, 0, 0); }
  return d;
}

export interface ClickStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

export function getClickStats(clicks?: LinkClick[]): ClickStats {
  const all = clicks ?? readClicks();
  const dayStart = startOf('day').getTime();
  const weekStart = startOf('week').getTime();
  const monthStart = startOf('month').getTime();
  const yearStart = startOf('year').getTime();
  return {
    total: all.length,
    today: all.filter(c => new Date(c.timestamp).getTime() >= dayStart).length,
    thisWeek: all.filter(c => new Date(c.timestamp).getTime() >= weekStart).length,
    thisMonth: all.filter(c => new Date(c.timestamp).getTime() >= monthStart).length,
    thisYear: all.filter(c => new Date(c.timestamp).getTime() >= yearStart).length,
  };
}

export interface TopLink {
  label: string;
  type: string;
  destination: string;
  count: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

export function getTopLinks(clicks?: LinkClick[], limit = 10): TopLink[] {
  const all = clicks ?? readClicks();
  const dayStart = startOf('day').getTime();
  const weekStart = startOf('week').getTime();
  const monthStart = startOf('month').getTime();

  const map = new Map<string, TopLink>();
  for (const c of all) {
    const key = c.label + '||' + c.destination;
    if (!map.has(key)) {
      map.set(key, { label: c.label, type: c.type, destination: c.destination, count: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
    }
    const entry = map.get(key)!;
    entry.count++;
    const ts = new Date(c.timestamp).getTime();
    if (ts >= dayStart) entry.todayCount++;
    if (ts >= weekStart) entry.weekCount++;
    if (ts >= monthStart) entry.monthCount++;
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getClicksByType(type: string, clicks?: LinkClick[]): LinkClick[] {
  const all = clicks ?? readClicks();
  return all.filter(c => c.type === type);
}

export function getSupporterClicks(clicks?: LinkClick[]): TopLink[] {
  const all = clicks ?? readClicks();
  return getTopLinks(all.filter(c => c.type === 'supporter'), 20);
}

export function getDonationFunnel() {
  const all = readClicks();
  const pageVisit = all.filter(c => c.type === 'donation_page_visit').length;
  const btnClick = all.filter(c => c.type === 'donate_button').length;
  const checkoutStart = all.filter(c => c.type === 'checkout_start').length;
  const success = all.filter(c => c.type === 'donation_success').length;
  const failed = all.filter(c => c.type === 'donation_failed').length;
  return { pageVisit, btnClick, checkoutStart, success, failed };
}

export function clearClicks() {
  writeClicks([]);
}

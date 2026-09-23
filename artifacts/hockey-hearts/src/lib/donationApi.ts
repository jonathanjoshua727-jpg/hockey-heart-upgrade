// Client for the donations backend (api-server mounted at /api).
// The frontend never decides donation success. Only the server-verified
// result counts.
import type { PaymentSettings } from "./contentStore";
const API_BASE = "/api";
export interface InitializeInput {
  amount: number;
  causeId: string;
  causeLabel: string;
  donorName: string;
  email: string;
  anonymous: boolean;
  message?: string;
  method: "card" | "bank_transfer";
  redirectPath?: string;
}
export interface InitializeResult {
  reference: string;
  amountCents: number;
  email: string;
  paymentLink: string;
}
export interface VerifiedDonation {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  causeLabel: string;
  method: string;
  date: string;
}
export interface ServerDonation {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "successful"
    | "failed"
    | "cancelled"
    | "refunded";
  donorName: string;
  donorEmail: string;
  anonymous: boolean;
  causeId: string;
  causeLabel: string;
  message: string | null;
  method: string;
  verifiedAt: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  date: string;
}
export interface DonationStats {
  totalRaised: number;
  counts: {
    successful: number;
    pending: number;
    failed: number;
    cancelled: number;
    refunded: number;
  };
  byCause: {
    causeId: string;
    causeLabel: string;
    total: number;
    count: number;
  }[];
  byMethod: {
    method: string;
    total: number;
    count: number;
  }[];
  byCurrency: {
    currency: string;
    total: number;
    count: number;
  }[];
}
type ServerPaymentSettings = Omit<
  PaymentSettings,
  "paystackPublicKey" | "paystackEnabled"
>;
type DonorPaymentSettings = Pick<
  ServerPaymentSettings,
  | "cardEnabled"
  | "bankTransferEnabled"
  | "bankTransferProviderName"
  | "cryptoEnabled"
  | "cryptoWallets"
>;
function withLegacyCompatibility(
  settings: ServerPaymentSettings,
): PaymentSettings {
  return {
    ...settings,
    paystackPublicKey: "",
    paystackEnabled: false,
  };
}
function withoutLegacyFields(
  settings: PaymentSettings,
): ServerPaymentSettings {
  const {
    paystackPublicKey: _paystackPublicKey,
    paystackEnabled: _paystackEnabled,
    ...serverSettings
  } = settings;
  return serverSettings;
}
async function jsonFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}
export function initializeDonation(
  input: InitializeInput,
): Promise<InitializeResult> {
  return jsonFetch<InitializeResult>("/donations/initialize", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      currency: "USD",
    }),
  });
}
export async function verifyDonation(
  reference: string,
): Promise<{
  verified: boolean;
  donation?: VerifiedDonation;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/donations/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    verified?: boolean;
    donation?: VerifiedDonation;
    error?: string;
  };
  return {
    verified: !!body.verified,
    donation: body.donation,
    error: body.error,
  };
}
export async function fetchPublicPaymentSettings(): Promise<PaymentSettings> {
  const settings = await jsonFetch<DonorPaymentSettings>(
    "/payment-settings",
  );
  return withLegacyCompatibility({
    ...settings,
    // Bank-account fields are admin-only and are never returned
    // by the public endpoint.
    bankDetails: getLocalBankDetails(),
  });
}
function getLocalBankDetails(): PaymentSettings["bankDetails"] {
  return {
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    instructions: "",
  };
}
// ── Admin API ──────────────────────────────────────────────────────────────
const ADMIN_TOKEN_KEY = "hhi_admin_api_token";
export function getAdminApiToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}
export function clearAdminApiToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}
export async function adminServerLogin(
  username: string,
  password: string,
): Promise<boolean> {
  try {
    const { token } = await jsonFetch<{ token: string }>(
      "/admin/login",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      },
    );
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}
export async function adminUpdateServerCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const token = getAdminApiToken();
  if (!token) {
    return false;
  }
  try {
    const { token: newToken } = await jsonFetch<{
      ok: boolean;
      token: string;
    }>("/admin/credentials", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    return true;
  } catch {
    return false;
  }
}
function adminHeaders(): Record<string, string> {
  const token = getAdminApiToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
export async function sendAdminTestEmail(
  to: string,
): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
}> {
  const token = getAdminApiToken();
  if (!token) {
    return {
      ok: false,
      error: "Not authenticated.",
    };
  }
  try {
    const result = await jsonFetch<{
      ok: boolean;
      message?: string;
    }>("/admin/test-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to }),
    });
    return result;
  } catch (err) {
    return {
      ok: false,
      error: (err as Error).message,
    };
  }
}
export function fetchAdminDonations(
  params: {
    status?: string;
    search?: string;
    causeId?: string;
  } = {},
): Promise<{ donations: ServerDonation[] }> {
  const qs = new URLSearchParams();
  if (params.status) {
    qs.set("status", params.status);
  }
  if (params.search) {
    qs.set("search", params.search);
  }
  if (params.causeId) {
    qs.set("causeId", params.causeId);
  }
  const q = qs.toString();
  return jsonFetch<{ donations: ServerDonation[] }>(
    `/admin/donations${q ? `?${q}` : ""}`,
    {
      headers: adminHeaders(),
    },
  );
}
export function fetchDonationStats(): Promise<DonationStats> {
  return jsonFetch<DonationStats>(
    "/admin/donations/stats",
    {
      headers: adminHeaders(),
    },
  );
}
export async function fetchAdminPaymentSettings(): Promise<PaymentSettings> {
  const settings = await jsonFetch<ServerPaymentSettings>(
    "/admin/payment-settings",
    {
      headers: adminHeaders(),
    },
  );
  return withLegacyCompatibility(settings);
}
export async function saveAdminPaymentSettings(
  settings: PaymentSettings,
): Promise<PaymentSettings> {
  const saved = await jsonFetch<ServerPaymentSettings>(
    "/admin/payment-settings",
    {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(
        withoutLegacyFields(settings),
      ),
    },
  );
  return withLegacyCompatibility(saved);
}

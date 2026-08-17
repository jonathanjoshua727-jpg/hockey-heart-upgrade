const PAYSTACK_BASE = "https://api.paystack.co";

export function getPaystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export interface PaystackVerifyData {
  id: number;
  status: string; // "success" | "failed" | "abandoned" | ...
  reference: string;
  amount: number; // minor units
  currency: string;
  gateway_response: string | null;
  channel: string | null;
  paid_at: string | null;
  customer?: { email?: string };
}

export async function paystackVerify(
  reference: string,
): Promise<{ ok: boolean; data?: PaystackVerifyData; error?: string }> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getPaystackSecret()}` } },
  );
  const body = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: PaystackVerifyData;
  } | null;
  if (!res.ok || !body?.status || !body.data) {
    return { ok: false, error: body?.message ?? `Paystack verify failed (${res.status})` };
  }
  return { ok: true, data: body.data };
}

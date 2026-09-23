import crypto from "node:crypto";

const FLW_BASE = "https://api.flutterwave.com/v3";

export function getFlutterwaveSecret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  return key;
}

/** Secret hash the admin sets in the Flutterwave dashboard for webhooks. */
export function getFlutterwaveWebhookHash(): string | null {
  return process.env.FLUTTERWAVE_SECRET_HASH || null;
}

interface FlwEnvelope<T> {
  status?: string;
  message?: string;
  data?: T;
}

// ── Create a hosted payment link (Flutterwave Standard) ─────────────────────
export async function flutterwaveCreatePayment(input: {
  txRef: string;
  amountUsd: number;
  email: string;
  name: string;
  redirectUrl: string;
  paymentOptions: string;
}): Promise<{ ok: boolean; link?: string; error?: string }> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getFlutterwaveSecret()}`,
    },
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amountUsd.toFixed(2),
      currency: "USD",
      payment_options: input.paymentOptions,
      redirect_url: input.redirectUrl,
      customer: { email: input.email, name: input.name },
      customizations: {
        title: "Hockey Heart Initiative",
        description: "Secure donation checkout",
      },
    }),
  });
  const body = (await res.json().catch(() => null)) as FlwEnvelope<{ link?: string }> | null;
  if (!res.ok || body?.status !== "success" || !body.data?.link) {
    return { ok: false, error: body?.message ?? `Payment initialization failed (${res.status})` };
  }
  return { ok: true, link: body.data.link };
}

export interface FlutterwaveVerifyData {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  payment_type: string | null;
  processor_response: string | null;
  created_at: string | null;
  customer?: { email?: string };
}

export async function flutterwaveVerifyByTxRef(
  txRef: string,
): Promise<{
  ok: boolean;
  data?: FlutterwaveVerifyData;
  notFound?: boolean;
  error?: string;
}> {
  const res = await fetch(
    `${FLW_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${getFlutterwaveSecret()}` } },
  );
  const body = (await res.json().catch(() => null)) as FlwEnvelope<FlutterwaveVerifyData> | null;
  if (res.status === 404 || (body?.status === "error" && /no transaction/i.test(body?.message ?? ""))) {
    return { ok: false, notFound: true, error: body?.message ?? "Transaction not found" };
  }
  if (!res.ok || body?.status !== "success" || !body.data) {
    return { ok: false, error: body?.message ?? `Verification failed (${res.status})` };
  }
  return { ok: true, data: body.data };
}

// Confirm that a completed refund exists for a transaction.
export async function flutterwaveFindCompletedRefund(txId: number): Promise<{
  ok: boolean;
  refunded?: boolean;
  error?: string;
}> {
  const res = await fetch(`${FLW_BASE}/refunds?tx_id=${encodeURIComponent(String(txId))}`, {
    headers: { Authorization: `Bearer ${getFlutterwaveSecret()}` },
  });
  const body = (await res.json().catch(() => null)) as FlwEnvelope<
    { tx_id?: number; status?: string }[]
  > | null;
  if (!res.ok || body?.status !== "success" || !Array.isArray(body.data)) {
    return { ok: false, error: body?.message ?? `Refund lookup failed (${res.status})` };
  }
  const refunded = body.data.some(
    (refund) =>
      Number(refund.tx_id) === txId &&
      /^(completed|successful|processed)$/i.test(refund.status ?? ""),
  );
  return { ok: true, refunded };
}

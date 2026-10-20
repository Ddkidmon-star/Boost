/**
 * Paystack Payment Gateway Client Service
 * Interacts with secure backend endpoints on /api/paystack/*
 */

export interface PaystackStatus {
  configured: boolean;
  publicKey: string;
  currency: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  verified?: boolean;
  amount?: number;
  currency?: string;
  reference?: string;
  message?: string;
}

// Exchange rate helper (₦1,500 = $1.00 USD)
export const NGN_PER_USD = 1500;

export function nairaToUsd(naira: number): number {
  return Number((naira / NGN_PER_USD).toFixed(2));
}

export function usdToNaira(usd: number): number {
  return Math.round(usd * NGN_PER_USD);
}

export async function getPaystackStatus(): Promise<PaystackStatus> {
  try {
    const res = await fetch('/api/paystack/status');
    if (!res.ok) throw new Error('Status query failed');
    return await res.json();
  } catch {
    return { configured: false, publicKey: '', currency: 'NGN' };
  }
}

export async function savePaystackKeys(secretKey: string, publicKey?: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/paystack/save-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretKey, publicKey }),
  });
  return await res.json();
}

export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in NGN
  currency?: string;
}): Promise<PaystackInitResponse> {
  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      currency: params.currency || 'NGN',
    }),
  });
  return await res.json();
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`);
  return await res.json();
}

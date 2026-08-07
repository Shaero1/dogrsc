import { getApiBase } from '@/lib/get-api-base';

export type PaymentMethod = 'BANK' | 'CRYPTO';

export type CreateDonationPayload = {
  amount: number;
  donorName: string;
  donorEmail: string;
  paymentMethod: PaymentMethod;
  currency?: string;
  captchaToken: string;
};

export type DonationResponse = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: PaymentMethod | null;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export async function createDonationPublic(
  payload: CreateDonationPayload,
): Promise<DonationResponse> {
  const res = await fetch(`${getApiBase()}/donate/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

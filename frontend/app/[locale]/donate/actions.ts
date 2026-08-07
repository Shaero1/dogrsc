'use server';

import { redirect } from 'next/navigation';
import {
  createDonationPublic,
  type PaymentMethod,
} from '@/lib/donations-api';
import type { DonationSubmitErrorCode } from '@/components/DonationReportForm';

function isPaymentMethod(value: string): value is PaymentMethod {
  return value === 'BANK' || value === 'CRYPTO';
}

export async function submitDonation(
  formData: FormData,
  locale: string,
): Promise<{ errorCode?: DonationSubmitErrorCode } | void> {
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const donorName = String(formData.get('donorName') ?? '').trim();
  const donorEmail = String(formData.get('donorEmail') ?? '').trim();
  const paymentMethodRaw = String(formData.get('paymentMethod') ?? '').trim();
  const captchaToken = String(formData.get('captchaToken') ?? '').trim();

  if (!captchaToken) {
    return { errorCode: 'captchaRequired' };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { errorCode: 'invalidAmount' };
  }

  if (!donorName || !donorEmail || !paymentMethodRaw) {
    return { errorCode: 'missingFields' };
  }

  if (!isPaymentMethod(paymentMethodRaw)) {
    return { errorCode: 'invalidPaymentMethod' };
  }

  await createDonationPublic({
    amount,
    donorName,
    donorEmail,
    paymentMethod: paymentMethodRaw,
    captchaToken,
  });

  redirect(`/${locale}/donate/thank-you`);
}

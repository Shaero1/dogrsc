'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { unstable_rethrow } from 'next/navigation';
import type { PaymentMethod } from '@/lib/donations-api';

export type DonationSubmitErrorCode =
  | 'invalidAmount'
  | 'missingFields'
  | 'invalidPaymentMethod'
  | 'captchaRequired'
  | 'captchaMissing';

type DonationReportFormProps = {
  paymentMethod: PaymentMethod;
  onSubmit: (formData: FormData) => Promise<{ errorCode?: DonationSubmitErrorCode } | void>;
};

export function DonationReportForm({
  paymentMethod,
  onSubmit,
}: DonationReportFormProps) {
  const t = useTranslations('donate.form');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const amountLabel =
    paymentMethod === 'CRYPTO' ? t('amountLabelCrypto') : t('amountLabelBank');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!siteKey) {
      setError(t('captchaMissing'));
      setSubmitting(false);
      return;
    }

    if (!captchaToken) {
      setError(t('captchaRequired'));
      setSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set('paymentMethod', paymentMethod);
    formData.set('captchaToken', captchaToken);

    try {
      const result = await onSubmit(formData);
      if (result?.errorCode) {
        setError(t(`errors.${result.errorCode}`));
        setSubmitting(false);
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch (err) {
      unstable_rethrow(err);
      setError(err instanceof Error ? err.message : t('submitError'));
      setSubmitting(false);
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <div>
        <label htmlFor="donation-amount" className="block text-sm font-medium text-zinc-700">
          {amountLabel}
        </label>
        <input
          id="donation-amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="donation-name" className="block text-sm font-medium text-zinc-700">
          {t('nameLabel')}
        </label>
        <input
          id="donation-name"
          name="donorName"
          type="text"
          required
          minLength={1}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="donation-email" className="block text-sm font-medium text-zinc-700">
          {t('emailLabel')}
        </label>
        <input
          id="donation-email"
          name="donorEmail"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {siteKey ? (
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
        />
      ) : (
        <p className="text-sm text-amber-800">{t('captchaMissing')}</p>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || !siteKey}
        className="w-full rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

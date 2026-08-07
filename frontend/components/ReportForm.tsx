'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { unstable_rethrow } from 'next/navigation';

type ReportFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
};

export function ReportForm({ onSubmit }: ReportFormProps) {
  const t = useTranslations('reportForm');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  function handleUseLocation() {
    setGeoMessage(null);

    if (!navigator.geolocation) {
      setGeoMessage(t('geoUnsupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGeoMessage(t('geoSuccess'));
      },
      () => {
        setLatitude(null);
        setLongitude(null);
        setGeoMessage(t('geoDenied'));
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!siteKey) {
      setError(t('captchaMissing'));
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setError(t('captchaRequired'));
      setLoading(false);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('captchaToken', captchaToken);

    if (latitude !== null) {
      formData.set('latitude', String(latitude));
    }
    if (longitude !== null) {
      formData.set('longitude', String(longitude));
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      unstable_rethrow(err);
      setError(err instanceof Error ? err.message : t('submitError'));
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          {t('nameLabel')}
        </label>
        <input
          name="reporterName"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          {t('phoneLabel')}
        </label>
        <input
          name="reporterPhone"
          required
          minLength={5}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          {t('emailLabel')}
        </label>
        <input
          name="reporterEmail"
          type="email"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          {t('descriptionLabel')}
        </label>
        <textarea
          name="description"
          required
          minLength={10}
          rows={5}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          {t('photoLabel')}
        </label>
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block w-full text-sm"
        />
      </div>
      <div>
        <button
          type="button"
          onClick={handleUseLocation}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          {t('useLocation')}
        </button>
        {geoMessage ? (
          <p className="mt-2 text-sm text-zinc-600">{geoMessage}</p>
        ) : null}
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
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading || !siteKey}
        className="rounded-md bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {loading ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

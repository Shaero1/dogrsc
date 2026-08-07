'use server';

import { redirect } from 'next/navigation';
import {
  createLostReport,
  uploadLostReportMedia,
} from '@/lib/reports-api';

export type SubmitReportResult = { error: string } | undefined;

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: string }).digest === 'string' &&
    (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

export async function submitLostReport(
  formData: FormData,
  locale: string,
): Promise<SubmitReportResult> {
  try {
    const reporterName = String(formData.get('reporterName') ?? '').trim();
    const reporterPhone = String(formData.get('reporterPhone') ?? '').trim();
    const reporterEmailRaw = String(formData.get('reporterEmail') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const captchaToken = String(formData.get('captchaToken') ?? '').trim();
    const latitudeRaw = formData.get('latitude');
    const longitudeRaw = formData.get('longitude');

    const payload = {
      reporterName,
      reporterPhone,
      description,
      captchaToken,
      ...(reporterEmailRaw ? { reporterEmail: reporterEmailRaw } : {}),
      ...(latitudeRaw ? { latitude: Number(latitudeRaw) } : {}),
      ...(longitudeRaw ? { longitude: Number(longitudeRaw) } : {}),
    };

    const report = await createLostReport(payload);

    const photo = formData.get('photo');
    if (photo instanceof File && photo.size > 0) {
      await uploadLostReportMedia(report.id, photo);
    }

    redirect(`/${locale}/lost-dog/thank-you`);
  } catch (err) {
    if (isNextRedirect(err)) {
      throw err;
    }

    return {
      error: err instanceof Error ? err.message : 'Submit failed',
    };
  }
}

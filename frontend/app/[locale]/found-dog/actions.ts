'use server';

import { redirect } from 'next/navigation';
import {
  createFoundReport,
  uploadFoundReportMedia,
} from '@/lib/reports-api';

export async function submitFoundReport(formData: FormData, locale: string) {
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

  const report = await createFoundReport(payload);

  const photo = formData.get('photo');
  if (photo instanceof File && photo.size > 0) {
    await uploadFoundReportMedia(report.id, photo);
  }

  redirect(`/${locale}/found-dog/thank-you`);
}

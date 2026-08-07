'use client';

import { ReportForm } from '@/components/ReportForm';
import { submitLostReport } from '../actions';

export function LostDogFormClient({ locale }: { locale: string }) {
  return (
    <ReportForm
      onSubmit={async (formData) => {
        const result = await submitLostReport(formData, locale);
        if (result?.error) {
          throw new Error(result.error);
        }
      }}
    />
  );
}

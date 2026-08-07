'use client';

import { ReportForm } from '@/components/ReportForm';
import { submitFoundReport } from '../actions';

export function FoundDogFormClient({ locale }: { locale: string }) {
  return (
    <ReportForm
      onSubmit={async (formData) => {
        const result = await submitFoundReport(formData, locale);
        if (result?.error) {
          throw new Error(result.error);
        }
      }}
    />
  );
}

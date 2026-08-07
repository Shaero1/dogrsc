'use client';

import { ReportForm } from '@/components/ReportForm';
import { submitFoundReport } from '../actions';

export function FoundDogFormClient({ locale }: { locale: string }) {
  return (
    <ReportForm
      onSubmit={async (formData) => {
        await submitFoundReport(formData, locale);
      }}
    />
  );
}

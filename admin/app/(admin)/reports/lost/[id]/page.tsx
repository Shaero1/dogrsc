'use client';

import { useParams } from 'next/navigation';
import { ReportDetailView } from '@/components/admin/ReportDetailView';

export default function LostReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }

  return <ReportDetailView kind="lost" id={id} />;
}

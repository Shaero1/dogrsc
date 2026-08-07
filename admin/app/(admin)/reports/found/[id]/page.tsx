'use client';

import { useParams } from 'next/navigation';
import { ReportDetailView } from '@/components/admin/ReportDetailView';

export default function FoundReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }

  return <ReportDetailView kind="found" id={id} />;
}

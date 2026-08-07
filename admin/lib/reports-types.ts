export type ReportStatus = 'ACTIVE' | 'HIDDEN' | 'VERIFIED';

export type ReportListItem = {
  id: string;
  reporterName: string;
  reporterPhone: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  hasLocation: boolean;
  verified: boolean;
};

export type PaginatedReports = {
  items: ReportListItem[];
  total: number;
  page: number;
  limit: number;
};

export type ReportDetail = {
  id: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string | null;
  description: string;
  latitude?: string | null;
  longitude?: string | null;
  status: ReportStatus;
  media: { id: string; url: string; mimeType: string }[];
  createdAt: string;
  updatedAt: string;
};

export type ReportListParams = {
  page?: number;
  limit?: number;
  status?: ReportStatus;
};

export type UpdateReportStatusPayload = {
  status: ReportStatus;
};

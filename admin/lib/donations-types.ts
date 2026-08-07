export type PaymentMethod = 'BANK' | 'CRYPTO';

export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type DonationRecord = {
  id: string;
  amount: string;
  currency: string;
  status: DonationStatus;
  paymentMethod: PaymentMethod | null;
  donorName: string | null;
  donorEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DonationsListResponse = {
  items: DonationRecord[];
  total: number;
  page: number;
  limit: number;
};

export type CreateDonationAdminPayload = {
  amount: number;
  donorName?: string;
  donorEmail?: string;
  paymentMethod?: PaymentMethod;
  currency?: string;
  status?: DonationStatus;
};

export type UpdateDonationStatusPayload = {
  status: 'CONFIRMED' | 'FAILED';
};

export const PAYMENT_METHODS: PaymentMethod[] = ['BANK', 'CRYPTO'];

export const DONATION_STATUSES: DonationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'FAILED',
];

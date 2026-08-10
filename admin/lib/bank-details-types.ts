export const BANK_DETAIL_FIELDS = [
  'bankAccountName',
  'bankName',
  'bankAccountNumber',
  'bankNote',
] as const;

export type BankDetailField = (typeof BANK_DETAIL_FIELDS)[number];

export const BANK_DETAIL_LABELS: Record<BankDetailField, string> = {
  bankAccountName: 'Account name',
  bankName: 'Bank name',
  bankAccountNumber: 'Account number',
  bankNote: 'Note for donors',
};

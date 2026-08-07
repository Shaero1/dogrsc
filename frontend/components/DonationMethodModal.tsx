'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CryptoAddressList } from '@/components/CryptoAddressList';
import { DonationReportForm } from '@/components/DonationReportForm';
import type { CryptoAddressPublic } from '@/lib/donate-api';
import type { PaymentMethod } from '@/lib/donations-api';

type BankContent = {
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankNote: string;
};

type DonationMethodModalProps = {
  open: boolean;
  method: PaymentMethod | null;
  cryptoItems: CryptoAddressPublic[];
  bankContent: BankContent;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function DonationMethodModal({
  open,
  method,
  cryptoItems,
  bankContent,
  onClose,
  onSubmit,
}: DonationMethodModalProps) {
  const t = useTranslations('donate');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && method) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, method]);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  if (!method) {
    return null;
  }

  const title = method === 'BANK' ? t('bankModalTitle') : t('cryptoModalTitle');

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="w-full max-w-lg rounded-lg border border-zinc-200 p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
            aria-label={t('modalClose')}
          >
            ×
          </button>
        </div>

        {method === 'BANK' ? (
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            <p>{bankContent.bankAccountName}</p>
            <p>{bankContent.bankName}</p>
            <p>{bankContent.bankAccountNumber}</p>
            <p className="text-zinc-600">{bankContent.bankNote}</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-sm text-zinc-600">{t('cryptoSubtitle')}</p>
            <CryptoAddressList items={cryptoItems} />
          </div>
        )}

        <div className="mt-6 border-t border-zinc-100 pt-6">
          <h3 className="text-sm font-medium text-zinc-900">{t('form.sectionTitle')}</h3>
          <p className="mt-1 text-sm text-zinc-600">{t('form.sectionHint')}</p>
          <div className="mt-4">
            <DonationReportForm paymentMethod={method} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </dialog>
  );
}

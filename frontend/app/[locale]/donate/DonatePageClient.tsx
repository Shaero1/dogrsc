'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DonationMethodModal } from '@/components/DonationMethodModal';
import type { CryptoAddressPublic } from '@/lib/donate-api';
import type { PaymentMethod } from '@/lib/donations-api';
import { submitDonation } from './actions';

type DonatePageClientProps = {
  locale: string;
  cryptoItems: CryptoAddressPublic[];
  bankContent: {
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankNote: string;
  };
};

export function DonatePageClient({
  locale,
  cryptoItems,
  bankContent,
}: DonatePageClientProps) {
  const t = useTranslations('donate');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(nextMethod: PaymentMethod) {
    setMethod(nextMethod);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setMethod(null);
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => openModal('CRYPTO')}
          className="rounded-md bg-amber-800 px-6 py-3 text-sm font-medium text-white hover:bg-amber-900"
        >
          {t('buttonCrypto')}
        </button>
        <button
          type="button"
          onClick={() => openModal('BANK')}
          className="rounded-md border border-amber-800 px-6 py-3 text-sm font-medium text-amber-800 hover:bg-amber-50"
        >
          {t('buttonBank')}
        </button>
      </div>

      <DonationMethodModal
        open={modalOpen}
        method={method}
        cryptoItems={cryptoItems}
        bankContent={bankContent}
        onClose={closeModal}
        onSubmit={async (formData) => {
          await submitDonation(formData, locale);
        }}
      />
    </>
  );
}

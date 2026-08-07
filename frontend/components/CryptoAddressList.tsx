'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CryptoAddressPublic } from '@/lib/donate-api';
import { formatCryptoLabel } from '@/lib/donate-api';

type CryptoAddressListProps = {
  items: CryptoAddressPublic[];
};

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CryptoAddressList({ items }: CryptoAddressListProps) {
  const t = useTranslations('donate');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(id: string, address: string) {
    const ok = await copyText(address);
    if (ok) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-zinc-600">{t('cryptoEmpty')}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-zinc-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">
                {formatCryptoLabel(item)}
              </p>
              <p className="mt-2 break-all font-mono text-sm text-zinc-700">
                {item.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleCopy(item.id, item.address)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
            >
              {copiedId === item.id ? t('copied') : t('copy')}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

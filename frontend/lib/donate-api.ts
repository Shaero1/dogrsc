import { getApiBase } from '@/lib/get-api-base';

export type CryptoAddressPublic = {
  id: string;
  currencyCode: string;
  label?: string | null;
  address: string;
};

export type CryptoAddressesResponse = {
  items: CryptoAddressPublic[];
};

export async function fetchCryptoAddresses(): Promise<CryptoAddressesResponse> {
  try {
    const res = await fetch(`${getApiBase()}/donate/crypto-addresses`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return { items: [] };
    }

    return res.json();
  } catch {
    return { items: [] };
  }
}

export function formatCryptoLabel(item: CryptoAddressPublic): string {
  if (item.label && item.label.length > 0) {
    return item.label;
  }
  return item.currencyCode;
}

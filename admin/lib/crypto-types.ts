export type CryptoAddressAdmin = {
  id: string;
  currencyCode: string;
  label: string | null;
  address: string;
  isActive: boolean;
  isDisplayed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CryptoAddressesAdminResponse = {
  items: CryptoAddressAdmin[];
};

export type CreateCryptoAddressPayload = {
  currencyCode: string;
  label?: string;
  address: string;
  setAsDisplayed?: boolean;
};

export type UpdateCryptoAddressPayload = {
  address?: string;
  label?: string;
  isActive?: boolean;
  isDisplayed?: boolean;
};

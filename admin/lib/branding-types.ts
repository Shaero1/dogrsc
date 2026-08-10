export type BrandingImage = {
  id: string;
  url: string;
  mimeType: string;
};

export type BrandingPublic = {
  logo: BrandingImage | null;
  heroImage: BrandingImage | null;
};

export type BrandingAdmin = BrandingPublic & {
  heroMedia: BrandingImage[];
  logoMedia: BrandingImage[];
};

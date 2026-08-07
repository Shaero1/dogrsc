export const CONTENT_ENTITY_TYPE = 'page' as const;

export const CONTENT_LOCALES = ['en', 'th', 'ru'] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const CONTENT_FALLBACK_LOCALE: ContentLocale = 'en';

export type ContentPageDefinition = {
  id: string;
  label: string;
  fields: readonly string[];
};

export const CONTENT_PAGES: readonly ContentPageDefinition[] = [
  {
    id: 'home',
    label: 'Home hero & stats',
    fields: [
      'heroTitle',
      'heroSubtitle',
      'helpButton',
      'findDogButton',
      'reportFoundButton',
      'statsSectionEnabled',
      'statLabel',
    ],
  },
  {
    id: 'faq',
    label: 'FAQ',
    fields: [
      'title',
      'subtitle',
      'faq1Question',
      'faq1Answer',
      'faq2Question',
      'faq2Answer',
      'faq3Question',
      'faq3Answer',
      'faq4Question',
      'faq4Answer',
      'faq5Question',
      'faq5Answer',
      'ctaContact',
    ],
  },
  {
    id: 'about',
    label: 'About',
    fields: [
      'title',
      'subtitle',
      'missionTitle',
      'missionBody',
      'workTitle',
      'workItem1',
      'workItem2',
      'workItem3',
      'helpTitle',
      'helpBody',
      'ctaDonate',
      'ctaDogs',
      'ctaFound',
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    fields: [
      'title',
      'subtitle',
      'reachTitle',
      'emailLabel',
      'emailValue',
      'phoneLabel',
      'phoneValue',
      'lineLabel',
      'lineValue',
      'hoursTitle',
      'hoursBody',
      'addressTitle',
      'addressBody',
      'noteBody',
      'ctaFound',
    ],
  },
  {
    id: 'stories',
    label: 'Stories page intro',
    fields: ['title', 'subtitle', 'ctaDonate', 'ctaDogs'],
  },
  {
    id: 'donate-bank',
    label: 'Donate — bank details',
    fields: [
      'bankAccountName',
      'bankName',
      'bankAccountNumber',
      'bankNote',
    ],
  },
] as const;

export function findContentPage(entityId: string): ContentPageDefinition | undefined {
  return CONTENT_PAGES.find((page) => page.id === entityId);
}

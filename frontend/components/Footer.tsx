import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Footer() {
  const t = useTranslations('footer');
  const tSite = useTranslations('site');

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-zinc-900">{tSite('name')}</p>
          <p className="text-sm text-zinc-600">{t('rights')}</p>
        </div>
        <LocaleSwitcher />
      </div>
    </footer>
  );
}

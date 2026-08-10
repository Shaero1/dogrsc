import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';
import { cn } from '@/lib/cn';

type FooterProps = {
  hasBackgroundImage?: boolean;
};

export function Footer({ hasBackgroundImage = false }: FooterProps) {
  const t = useTranslations('footer');
  const tSite = useTranslations('site');

  return (
    <footer
      className={cn(
        'mt-auto border-t',
        hasBackgroundImage
          ? 'border-white/10 bg-zinc-950/75 text-white backdrop-blur-md'
          : 'border-zinc-200 bg-zinc-50 text-zinc-900',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{tSite('name')}</p>
          <p
            className={cn(
              'text-sm',
              hasBackgroundImage ? 'text-zinc-300' : 'text-zinc-600',
            )}
          >
            {t('rights')}
          </p>
        </div>
        <LocaleSwitcher variant={hasBackgroundImage ? 'dark' : 'light'} />
      </div>
    </footer>
  );
}

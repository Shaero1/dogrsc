import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const navItems = [
  { key: 'home' as const, href: '/' },
  { key: 'about' as const, href: '/about' },
  { key: 'faq' as const, href: '/faq' },
  { key: 'stories' as const, href: '/stories' },
  { key: 'dogs' as const, href: '/dogs' },
  { key: 'found' as const, href: '/found-dog' },
  { key: 'lost' as const, href: '/lost-dog' },
  { key: 'map' as const, href: '/map' },
  { key: 'donate' as const, href: '/donate' },
  { key: 'contact' as const, href: '/contact' },
];

type HeaderProps = {
  logoUrl?: string | null;
};

export function Header({ logoUrl }: HeaderProps) {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-amber-800"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-auto max-w-[160px] object-contain sm:h-12 sm:max-w-[200px]"
            />
          ) : null}
          <span>{tSite('name')}</span>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="text-zinc-700 hover:text-amber-800"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

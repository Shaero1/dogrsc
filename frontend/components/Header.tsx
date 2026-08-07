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

export function Header() {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-amber-800">
          {tSite('name')}
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

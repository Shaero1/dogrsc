'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

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
  hasBackgroundImage?: boolean;
};

export function Header({
  logoUrl,
  hasBackgroundImage = false,
}: HeaderProps) {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasBackgroundImage) {
      return;
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasBackgroundImage]);

  const glass = hasBackgroundImage && !scrolled;
  const solidOnScroll = hasBackgroundImage && scrolled;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        glass &&
          'border-white/15 bg-white/10 text-white backdrop-blur-md',
        solidOnScroll &&
          'border-zinc-200 bg-white/95 text-zinc-900 shadow-sm backdrop-blur-md',
        !hasBackgroundImage && 'border-zinc-200 bg-white text-zinc-900',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:py-3.5">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2.5 text-xl font-semibold sm:text-2xl',
            glass ? 'text-amber-200' : 'text-amber-800',
          )}
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
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-base">
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              prefetch={false}
              className={cn(
                glass && 'text-white/90 hover:text-amber-200',
                solidOnScroll && 'text-zinc-700 hover:text-amber-800',
                !hasBackgroundImage && 'text-zinc-700 hover:text-amber-800',
              )}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

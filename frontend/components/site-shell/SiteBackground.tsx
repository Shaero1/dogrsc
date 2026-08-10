'use client';

import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type SiteBackgroundProps = {
  imageUrl: string | null;
};

function useMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)');

    const update = () => {
      setEnabled(!reducedMotion.matches && !mobile.matches);
    };

    update();
    reducedMotion.addEventListener('change', update);
    mobile.addEventListener('change', update);

    return () => {
      reducedMotion.removeEventListener('change', update);
      mobile.removeEventListener('change', update);
    };
  }, []);

  return enabled;
}

export function SiteBackground({ imageUrl }: SiteBackgroundProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const motionEnabled = useMotionEnabled();
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    if (!isHome || !motionEnabled) {
      setParallaxY(0);
      return;
    }

    const onScroll = () => {
      setParallaxY(window.scrollY * 0.12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, motionEnabled]);

  if (!imageUrl) {
    return null;
  }

  const homeMotion = isHome && motionEnabled;

  return (
    <div
      className="site-background-root pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={
          homeMotion ? { transform: `translate3d(0, ${-parallaxY}px, 0)` } : undefined
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className={cn(
            'h-full w-full object-cover',
            homeMotion ? 'site-bg-ken-burns h-[110%]' : 'scale-105',
          )}
        />
      </div>
      <div className="absolute inset-0 bg-zinc-900/55" />
    </div>
  );
}

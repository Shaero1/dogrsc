'use client';

import { createContext, useContext } from 'react';

type SiteShellContextValue = {
  hasBackgroundImage: boolean;
};

const SiteShellContext = createContext<SiteShellContextValue>({
  hasBackgroundImage: false,
});

type SiteShellProviderProps = {
  hasBackgroundImage: boolean;
  children: React.ReactNode;
};

export function SiteShellProvider({
  hasBackgroundImage,
  children,
}: SiteShellProviderProps) {
  return (
    <SiteShellContext.Provider value={{ hasBackgroundImage }}>
      {children}
    </SiteShellContext.Provider>
  );
}

export function useSiteShell(): SiteShellContextValue {
  return useContext(SiteShellContext);
}

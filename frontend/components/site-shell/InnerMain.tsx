import { cn } from '@/lib/cn';

const maxWidthClass = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
} as const;

type InnerMainProps = {
  children: React.ReactNode;
  /** Page title block — rendered outside the glass panel */
  header?: React.ReactNode;
  maxWidth?: keyof typeof maxWidthClass;
  /** Denser panel for forms and payment details */
  solid?: boolean;
  className?: string;
  panelClassName?: string;
};

export function InnerMain({
  children,
  header,
  maxWidth = '6xl',
  solid = false,
  className,
  panelClassName,
}: InnerMainProps) {
  return (
    <main
      className={cn(
        'mx-auto w-full flex-1 px-4 py-12',
        maxWidthClass[maxWidth],
        className,
      )}
    >
      {header ? <div className="page-header mb-8">{header}</div> : null}
      <div
        className={cn(
          solid ? 'glass-panel-form' : 'glass-panel-page',
          panelClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

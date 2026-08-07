type HomeStatsSectionProps = {
  value: number;
  label: string;
  locale: string;
};

export function HomeStatsSection({
  value,
  label,
  locale,
}: HomeStatsSectionProps) {
  const formatted = value.toLocaleString(locale);

  return (
    <section
      className="mt-16 border-t border-zinc-100 pt-12"
      aria-label={label}
    >
      <div className="mx-auto max-w-md text-center">
        <p className="text-5xl font-bold tabular-nums tracking-tight text-amber-800 sm:text-6xl">
          {formatted}
        </p>
        <p className="mt-3 text-base text-zinc-600">{label}</p>
      </div>
    </section>
  );
}

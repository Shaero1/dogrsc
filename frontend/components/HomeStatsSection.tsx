type HomeStatsSectionProps = {
  formattedValue: string;
  label: string;
  inverted?: boolean;
};

export function HomeStatsSection({
  formattedValue,
  label,
  inverted = false,
}: HomeStatsSectionProps) {
  return (
    <section
      className={`mt-16 border-t pt-12 ${
        inverted ? 'border-white/20' : 'border-zinc-100'
      }`}
      aria-label={label}
    >
      <div className="mx-auto max-w-md text-center">
        <p
          className={`text-5xl font-bold tabular-nums tracking-tight sm:text-6xl ${
            inverted ? 'text-amber-200' : 'text-amber-800'
          }`}
        >
          {formattedValue}
        </p>
        <p
          className={`mt-3 text-base ${inverted ? 'text-zinc-200' : 'text-zinc-600'}`}
        >
          {label}
        </p>
      </div>
    </section>
  );
}

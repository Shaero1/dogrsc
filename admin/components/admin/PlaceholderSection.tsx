export function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <p className="text-lg font-medium text-zinc-800">{title}</p>
      <p className="mt-2 text-sm text-zinc-500">
        This section will be implemented in a later task.
      </p>
    </div>
  );
}

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
    </header>
  );
}

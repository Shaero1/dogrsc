import { Link } from '@/i18n/navigation';
import type { StoryListItem } from '@/lib/stories-api';

type StoryCardProps = {
  item: StoryListItem;
  readMoreLabel: string;
  noPhotoLabel: string;
};

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function StoryCard({ item, readMoreLabel, noPhotoLabel }: StoryCardProps) {
  return (
    <li className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="aspect-[16/9] bg-zinc-100">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover.url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            {noPhotoLabel}
          </div>
        )}
      </div>
      <div className="p-5">
        <time
          dateTime={item.publishedAt}
          className="text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          {formatDate(item.publishedAt, item.locale)}
        </time>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900">
          <Link
            href={`/stories/${item.slug}`}
            className="hover:text-amber-900"
          >
            {item.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{item.excerpt}</p>
        <Link
          href={`/stories/${item.slug}`}
          className="mt-4 inline-block text-sm font-medium text-amber-800 hover:underline"
        >
          {readMoreLabel}
        </Link>
      </div>
    </li>
  );
}

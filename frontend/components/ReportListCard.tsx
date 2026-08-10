import { Link } from '@/i18n/navigation';
import type { PublicReportListItem } from '@/lib/reports-api';

type ReportListCardProps = {
  item: PublicReportListItem;
  basePath: '/found-dog' | '/lost-dog';
  noPhotoLabel: string;
  viewLabel: string;
  verifiedLabel: string;
};

function truncate(text: string, max = 160): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}

export function ReportListCard({
  item,
  basePath,
  noPhotoLabel,
  viewLabel,
  verifiedLabel,
}: ReportListCardProps) {
  return (
    <li className="glass-card">
      <div className="aspect-[4/3]">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="glass-card-media-empty">{noPhotoLabel}</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {new Date(item.createdAt).toLocaleString()}
          </p>
          {item.verified ? (
            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">
              {verifiedLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-4 text-sm text-zinc-700">
          {truncate(item.description)}
        </p>
        <Link
          href={`${basePath}/${item.id}`}
          className="mt-4 inline-block text-sm font-medium text-amber-800 hover:underline"
        >
          {viewLabel}
        </Link>
      </div>
    </li>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { deleteStory, fetchMe, listStories } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { StoryListItem } from '@/lib/stories-types';

const PAGE_SIZE = 20;

type PublishFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

export default function StoriesPage() {
  const [items, setItems] = useState<StoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const isPublished =
        publishFilter === 'PUBLISHED'
          ? true
          : publishFilter === 'DRAFT'
            ? false
            : undefined;

      const [stories, me] = await Promise.all([
        listStories(token, { page, limit: PAGE_SIZE, isPublished }),
        fetchMe(token),
      ]);

      setItems(stories.items);
      setTotal(stories.total);
      setIsAdmin(me.role === 'ADMIN');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [page, publishFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(story: StoryListItem) {
    const confirmed = window.confirm(
      `Delete "${story.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    const token = getToken();
    if (!token) return;

    setDeletingId(story.id);
    setError(null);

    try {
      await deleteStory(token, story.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminHeader title="Stories" />
      <div className="flex-1 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            Manage rescue stories shown on the public site.
          </p>
          <Link
            href="/stories/new"
            className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
          >
            Add story
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-600">
            Status
            <select
              value={publishFilter}
              onChange={(event) => {
                setPage(1);
                setPublishFilter(event.target.value as PublishFilter);
              }}
              className="ml-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
            No stories yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((story) => (
                  <tr key={story.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {story.title}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{story.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          story.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {story.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(story.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/stories/${story.id}/edit`}
                          className="text-amber-800 hover:underline"
                        >
                          Edit
                        </Link>
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(story)}
                            disabled={deletingId === story.id}
                            className="text-red-700 hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1 || loading}
              className="rounded-md border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-zinc-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-md border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

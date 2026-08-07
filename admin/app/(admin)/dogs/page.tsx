'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { archiveDog, fetchMe, listDogs } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { consumeDogFlash } from '@/lib/dog-flash';
import { DOG_STATUSES, type DogListItem, type DogStatus } from '@/lib/dogs-types';

const PAGE_SIZE = 20;

type StatusFilter = DogStatus | 'ALL' | 'ACTIVE';

export default function DogsPage() {
  const [items, setItems] = useState<DogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [photoUploadWarning, setPhotoUploadWarning] = useState<string | null>(
    null,
  );
  const [createdDogId, setCreatedDogId] = useState<string | null>(null);

  useEffect(() => {
    const flash = consumeDogFlash();
    if (flash.dogCreated) setCreateSuccess(true);
    if (flash.dogUpdated) setUpdateSuccess(true);
    if (flash.photoErrors) setPhotoUploadWarning(flash.photoErrors);
    if (flash.createdDogId) setCreatedDogId(flash.createdDogId);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [dogs, me] = await Promise.all([
        listDogs(token, {
          page,
          limit: PAGE_SIZE,
          excludeArchived: statusFilter === 'ACTIVE',
          status: statusFilter !== 'ALL' && statusFilter !== 'ACTIVE'
            ? statusFilter
            : undefined,
          search: search || undefined,
        }),
        fetchMe(token),
      ]);
      setItems(dogs.items);
      setTotal(dogs.total);
      setIsAdmin(me.role === 'ADMIN');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dogs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  async function handleArchive(dog: DogListItem) {
    const confirmed = window.confirm(
      `Archive "${dog.nameEn ?? dog.slug}"? It will be unpublished and hidden from the public site.`,
    );
    if (!confirmed) return;

    const token = getToken();
    if (!token) return;

    setArchivingId(dog.id);
    setError(null);

    try {
      await archiveDog(token, dog.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive dog');
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <>
      <AdminHeader title="Dogs" />
      <div className="flex-1 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            Manage dog profiles and photos. Add photos when creating a new dog,
            or upload more on the edit page.
          </p>
          <Link
            href="/dogs/new"
            className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
          >
            Add dog
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-700">Search slug</span>
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="luna"
                className="w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
            >
              Search
            </button>
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  setSearch('');
                  setPage(1);
                }}
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:underline"
              >
                Clear
              </button>
            ) : null}
          </form>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="ACTIVE">Active (not archived)</option>
              <option value="ALL">All statuses</option>
              {DOG_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {createSuccess ? (
          <p
            className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900"
            role="status"
          >
            Dog created successfully.
          </p>
        ) : null}
        {updateSuccess ? (
          <p
            className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900"
            role="status"
          >
            Dog updated successfully.
          </p>
        ) : null}
        {photoUploadWarning ? (
          <p
            className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            Dog saved, but some photos failed to upload: {photoUploadWarning}
            {createdDogId ? (
              <>
                {' '}
                <Link
                  href={`/dogs/${createdDogId}/edit`}
                  className="font-medium underline hover:text-amber-950"
                >
                  Open edit to retry
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}

        {!loading && !error ? (
          <>
            <p className="mb-2 text-sm text-zinc-500">
              {total} dog{total === 1 ? '' : 's'}
              {search ? ` matching “${search}”` : ''}
            </p>
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name (EN)</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((dog) => (
                    <tr key={dog.id} className="border-t border-zinc-100">
                      <td className="px-4 py-3">{dog.nameEn ?? '—'}</td>
                      <td className="px-4 py-3">{dog.slug}</td>
                      <td className="px-4 py-3">{dog.status}</td>
                      <td className="px-4 py-3">
                        {dog.isPublished ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <Link
                            href={`/dogs/${dog.id}/edit`}
                            className="text-amber-800 hover:underline"
                          >
                            Edit
                          </Link>
                          {isAdmin && dog.status !== 'ARCHIVED' ? (
                            <button
                              type="button"
                              disabled={archivingId === dog.id}
                              onClick={() => void handleArchive(dog)}
                              className="text-red-700 hover:underline disabled:opacity-50"
                            >
                              {archivingId === dog.id ? 'Archiving…' : 'Archive'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-500">No dogs found.</p>
              ) : null}
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-zinc-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}

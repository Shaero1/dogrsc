'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DogForm } from '@/components/admin/DogForm';
import {
  archiveDog,
  deleteMedia,
  fetchMe,
  getDog,
  updateDog,
  uploadDogMedia,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import { setDogFlash } from '@/lib/dog-flash';
import type { CreateDogPayload, DogAdmin } from '@/lib/dogs-types';

export default function EditDogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [dog, setDog] = useState<DogAdmin | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const token = getToken();
    if (!token) return;
    const [loaded, me] = await Promise.all([
      getDog(token, params.id),
      fetchMe(token),
    ]);
    setDog(loaded);
    setIsAdmin(me.role === 'ADMIN');
  }

  useEffect(() => {
    reload().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load dog');
    });
  }, [params.id]);

  async function handleSubmit(payload: CreateDogPayload) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await updateDog(token, params.id, payload);
    setDogFlash({ dogUpdated: true });
    router.push('/dogs');
  }

  async function handleUpload(file: File) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await uploadDogMedia(token, params.id, file);
    await reload();
  }

  async function handleDeletePhoto(mediaId: string) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await deleteMedia(token, mediaId);
    await reload();
  }

  async function handleArchive() {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await archiveDog(token, params.id);
    router.push('/dogs');
  }

  return (
    <>
      <AdminHeader title="Edit dog" />
      <div className="flex-1 p-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {dog ? (
          <DogForm
            initial={dog}
            canArchive={isAdmin && dog.status !== 'ARCHIVED'}
            onSubmit={handleSubmit}
            onArchive={handleArchive}
            onUploadPhoto={handleUpload}
            onDeletePhoto={handleDeletePhoto}
          />
        ) : (
          !error && <p className="text-sm text-zinc-500">Loading…</p>
        )}
      </div>
    </>
  );
}

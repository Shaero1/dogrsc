'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoryForm } from '@/components/admin/StoryForm';
import {
  deleteMedia,
  deleteStory,
  fetchMe,
  getStory,
  updateStory,
  uploadStoryMedia,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { CreateStoryPayload, StoryAdmin } from '@/lib/stories-types';

export default function EditStoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<StoryAdmin | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const token = getToken();
    if (!token) return;

    const [loaded, me] = await Promise.all([
      getStory(token, params.id),
      fetchMe(token),
    ]);

    setStory(loaded);
    setIsAdmin(me.role === 'ADMIN');
  }

  useEffect(() => {
    reload().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load story');
    });
  }, [params.id]);

  async function handleSubmit(payload: CreateStoryPayload) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await updateStory(token, params.id, payload);
    router.push('/stories');
  }

  async function handleUpload(file: File) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await uploadStoryMedia(token, params.id, file);
    await reload();
  }

  async function handleDeleteCover(mediaId: string) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await deleteMedia(token, mediaId);
    await reload();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Delete this story permanently? This cannot be undone.',
    );
    if (!confirmed) return;

    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    await deleteStory(token, params.id);
    router.push('/stories');
  }

  return (
    <>
      <AdminHeader title="Edit story" />
      <div className="flex-1 p-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {story ? (
          <StoryForm
            initial={story}
            canDelete={isAdmin}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onUploadCover={handleUpload}
            onDeleteCover={handleDeleteCover}
          />
        ) : (
          !error && <p className="text-sm text-zinc-500">Loading…</p>
        )}
      </div>
    </>
  );
}

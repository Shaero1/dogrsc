'use client';

import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoryForm } from '@/components/admin/StoryForm';
import { createStory, uploadStoryMedia } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { CreateStoryPayload } from '@/lib/stories-types';

export default function NewStoryPage() {
  const router = useRouter();

  async function handleSubmit(
    payload: CreateStoryPayload,
    options?: { pendingCover: File | null },
  ) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const story = await createStory(token, payload);
    const cover = options?.pendingCover;

    if (cover) {
      await uploadStoryMedia(token, story.id, cover);
    }

    router.push('/stories');
  }

  return (
    <>
      <AdminHeader title="New story" />
      <div className="flex-1 p-6">
        <StoryForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}

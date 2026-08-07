'use client';

import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DogForm } from '@/components/admin/DogForm';
import { createDog, uploadDogMedia } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { setDogFlash } from '@/lib/dog-flash';
import type { CreateDogPayload } from '@/lib/dogs-types';

export default function NewDogPage() {
  const router = useRouter();

  async function handleSubmit(
    payload: CreateDogPayload,
    options?: { pendingPhotos: File[] },
  ) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const dog = await createDog(token, payload);
    const photos = options?.pendingPhotos ?? [];

    if (photos.length === 0) {
      setDogFlash({ dogCreated: true });
      router.push('/dogs');
      return;
    }

    const errors: string[] = [];
    for (const file of photos) {
      try {
        await uploadDogMedia(token, dog.id, file);
      } catch (err) {
        errors.push(
          `${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`,
        );
      }
    }

    if (errors.length > 0) {
      setDogFlash({
        dogCreated: true,
        photoErrors: errors.join('; '),
        createdDogId: dog.id,
      });
    } else {
      setDogFlash({ dogCreated: true });
    }

    router.push('/dogs');
  }

  return (
    <>
      <AdminHeader title="New dog" />
      <div className="flex-1 p-6">
        <DogForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { PhotoUploadField } from '@/components/admin/PhotoUploadField';
import { deleteMedia, getBrandingAdmin, uploadBrandingMedia } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { BrandingImage } from '@/lib/branding-types';

const MAX_BYTES = 5 * 1024 * 1024;

function isAllowedImageFile(file: File): boolean {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return true;
  }
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}

function validateImageFile(file: File): string | null {
  if (!isAllowedImageFile(file)) {
    return 'Only JPEG, PNG, or WebP images are allowed.';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}

type BrandingImagePanelProps = {
  title: string;
  hint: string;
  entityType: 'page' | 'site';
  entityId: string;
  imageKey: 'logo' | 'heroImage';
};

export function BrandingImagePanel({
  title,
  hint,
  entityType,
  entityId,
  imageKey,
}: BrandingImagePanelProps) {
  const [current, setCurrent] = useState<BrandingImage | null>(null);
  const [allMedia, setAllMedia] = useState<BrandingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function loadBranding() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBrandingAdmin(token);
      setCurrent(data[imageKey]);
      setAllMedia(imageKey === 'logo' ? data.logoMedia : data.heroMedia);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBranding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, imageKey]);

  async function handleUpload(file: File) {
    const token = getToken();
    if (!token) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setSavedAt(null);

    try {
      for (const item of allMedia) {
        await deleteMedia(token, item.id);
      }

      await uploadBrandingMedia(token, entityType, entityId, file);
      setSavedAt(new Date().toLocaleTimeString());
      await loadBranding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    const token = getToken();
    if (!token || allMedia.length === 0) return;

    setRemoving(true);
    setError(null);
    setSavedAt(null);

    try {
      for (const item of allMedia) {
        await deleteMedia(token, item.id);
      }
      setSavedAt(new Date().toLocaleTimeString());
      await loadBranding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="mb-8 max-w-3xl rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-medium text-zinc-900">{title}</h2>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          {current ? (
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt=""
                className={
                  imageKey === 'logo'
                    ? 'max-h-16 w-auto object-contain p-3'
                    : 'max-h-48 w-full object-cover'
                }
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No image uploaded yet.</p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <PhotoUploadField
              buttonLabel={uploading ? 'Uploading…' : current ? 'Replace image' : 'Upload image'}
              hint="JPEG, PNG, or WebP. Max 5 MB."
              disabled={uploading || removing}
              resetInputAfterSelect
              onFilesSelected={(files) => {
                const file = files?.[0];
                if (file) {
                  void handleUpload(file);
                }
              }}
            />
            {current ? (
              <button
                type="button"
                disabled={uploading || removing}
                onClick={() => void handleRemove()}
                className="text-sm text-red-700 hover:underline disabled:opacity-50"
              >
                {removing ? 'Removing…' : 'Remove'}
              </button>
            ) : null}
            {savedAt ? (
              <span className="text-sm text-zinc-500">Saved at {savedAt}</span>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

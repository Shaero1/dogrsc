'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  CreateDogPayload,
  DOG_STATUSES,
  DogAdmin,
  DogDescriptions,
  DogSeo,
  DogStatus,
  emptyDescriptions,
  emptySeo,
  sanitizeDescriptions,
} from '@/lib/dogs-types';
import { slugify } from '@/lib/slug';

type LocaleKey = 'en' | 'th' | 'ru';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const LOCALES: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'th', label: 'Thai' },
  { key: 'ru', label: 'Russian' },
];

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type DogFormSubmitOptions = {
  pendingPhotos: File[];
};

type DogFormProps = {
  initial?: DogAdmin;
  canArchive?: boolean;
  onSubmit: (
    payload: CreateDogPayload,
    options?: DogFormSubmitOptions,
  ) => Promise<void>;
  onArchive?: () => Promise<void>;
  onUploadPhoto?: (file: File) => Promise<void>;
  onDeletePhoto?: (mediaId: string) => Promise<void>;
};

function isAllowedImageFile(file: File): boolean {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return true;
  }

  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}

function validatePhotoFile(file: File): string | null {
  if (!isAllowedImageFile(file)) {
    return 'Only JPEG, PNG, or WebP images are allowed.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return 'Each photo must be 5 MB or smaller.';
  }
  return null;
}

export function DogForm({
  initial,
  canArchive,
  onSubmit,
  onArchive,
  onUploadPhoto,
  onDeletePhoto,
}: DogFormProps) {
  const [tab, setTab] = useState<LocaleKey>('en');
  const [descriptions, setDescriptions] = useState<DogDescriptions>(
    initial?.descriptions ?? emptyDescriptions(),
  );
  const [seo, setSeo] = useState<DogSeo>(initial?.seo ?? emptySeo());
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [status, setStatus] = useState<DogStatus>(
    initial?.status ?? 'IN_CARE',
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [loading, setLoading] = useState(false);
  const [createSubmitted, setCreateSubmitted] = useState(false);
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState(initial?.media ?? []);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const pendingPhotosRef = useRef(pendingPhotos);
  pendingPhotosRef.current = pendingPhotos;

  const isCreateMode = !initial && !onUploadPhoto;
  const formLocked = loading || createSubmitted || editSubmitted || photoUploading;

  useEffect(() => {
    return () => {
      pendingPhotosRef.current.forEach((p) =>
        URL.revokeObjectURL(p.previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (!initial) return;
    setDescriptions(initial.descriptions);
    setSeo(initial.seo);
    setSlug(initial.slug);
    setStatus(initial.status);
    setIsPublished(initial.isPublished);
    setMedia(initial.media);
  }, [initial]);

  function updateLocaleField(
    locale: LocaleKey,
    field: 'name' | 'description' | 'rescueStory',
    value: string,
  ) {
    setDescriptions((prev) => {
      const next = { ...prev, [locale]: { ...prev[locale], [field]: value } };

      if (locale === 'en' && field === 'name' && !slugTouched) {
        setSlug(slugify(value));
      }

      return next;
    });
  }

  function updateSeoField(
    field: 'title' | 'description',
    locale: LocaleKey,
    value: string,
  ) {
    setSeo((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: value },
    }));
  }

  function addPendingPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const next: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      const validationError = validatePhotoFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (next.length > 0) {
      setPendingPhotos((prev) => [...prev, ...next]);
    }
  }

  function removePendingPhoto(id: string) {
    setPendingPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const enName = descriptions.en?.name?.trim() ?? '';
    const enDescription = descriptions.en?.description?.trim() ?? '';
    if (!enName || !enDescription) {
      setError('English name and description are required.');
      setTab('en');
      return;
    }

    setLoading(true);
    let submittedCreate = false;
    let submittedEdit = false;

    try {
      const payload: CreateDogPayload = {
        descriptions: sanitizeDescriptions(descriptions),
        seo,
        status,
        isPublished,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      };
      await onSubmit(payload, {
        pendingPhotos: pendingPhotos.map((p) => p.file),
      });

      if (isCreateMode) {
        submittedCreate = true;
        setCreateSubmitted(true);
      } else {
        submittedEdit = true;
        setEditSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      if (!submittedCreate && !submittedEdit) {
        setLoading(false);
      }
    }
  }

  async function handlePhotoUpload(file: File) {
    if (!onUploadPhoto) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setPhotoUploading(true);

    try {
      await onUploadPhoto(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Slug</label>
          <div className="mt-1 flex gap-2">
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              disabled={formLocked}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
              placeholder="luna"
            />
            <button
              type="button"
              disabled={formLocked}
              onClick={() => {
                setSlugTouched(false);
                setSlug(slugify(descriptions.en.name ?? ''));
              }}
              className="shrink-0 rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              From EN name
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as DogStatus);
            }}
            disabled={formLocked}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            {DOG_STATUSES.filter((s) => s !== 'ARCHIVED').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isPublished}
          disabled={formLocked}
          onChange={(e) => {
            setIsPublished(e.target.checked);
          }}
        />
        Published (visible on public API when status is AVAILABLE or IN_CARE)
      </label>

      <div>
        <div className="flex gap-2 border-b border-zinc-200">
          {LOCALES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium ${
                tab === key
                  ? 'border-b-2 border-amber-800 text-amber-900'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {label}
              {key === 'en' ? ' *' : ''}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4 rounded-md border border-zinc-200 p-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Name{tab === 'en' ? ' *' : ''}
            </label>
            <input
              value={descriptions[tab]?.name ?? ''}
              onChange={(e) => updateLocaleField(tab, 'name', e.target.value)}
              disabled={formLocked}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Description{tab === 'en' ? ' *' : ''}
            </label>
            <textarea
              value={descriptions[tab]?.description ?? ''}
              onChange={(e) =>
                updateLocaleField(tab, 'description', e.target.value)
              }
              disabled={formLocked}
              rows={4}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Rescue story
            </label>
            <textarea
              value={descriptions[tab]?.rescueStory ?? ''}
              onChange={(e) =>
                updateLocaleField(tab, 'rescueStory', e.target.value)
              }
              disabled={formLocked}
              rows={3}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO title
            </label>
            <input
              value={seo.title?.[tab] ?? ''}
              onChange={(e) => updateSeoField('title', tab, e.target.value)}
              disabled={formLocked}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              SEO description
            </label>
            <textarea
              value={seo.description?.[tab] ?? ''}
              onChange={(e) =>
                updateSeoField('description', tab, e.target.value)
              }
              disabled={formLocked}
              rows={2}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {onUploadPhoto ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-800">Photos</h3>
          <p className="text-sm text-zinc-600">
            JPEG, PNG, or WebP up to 5 MB each.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={formLocked}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handlePhotoUpload(file);
              e.target.value = '';
            }}
            className="block text-sm disabled:opacity-50"
          />
          {photoUploading ? (
            <p className="text-sm text-zinc-500">Uploading photo…</p>
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-3">
            {(initial?.media ?? media).map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-md border border-zinc-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="h-32 w-full object-cover"
                />
                {onDeletePhoto ? (
                  <button
                    type="button"
                    disabled={formLocked}
                    onClick={() => void onDeletePhoto(item.id)}
                    className="w-full px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : isCreateMode ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-800">Photos</h3>
          <p className="text-sm text-zinc-600">
            Optional. JPEG, PNG, or WebP up to 5 MB each. Uploaded when you save.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={formLocked}
            onChange={(e) => {
              addPendingPhotos(e.target.files);
              e.target.value = '';
            }}
            className="block text-sm disabled:opacity-50"
          />
          {pendingPhotos.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-3">
              {pendingPhotos.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-md border border-zinc-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    disabled={formLocked}
                    onClick={() => removePendingPhoto(item.id)}
                    className="w-full px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={formLocked}
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
        >
          {loading
            ? isCreateMode && pendingPhotos.length > 0
              ? 'Saving & uploading…'
              : 'Saving…'
            : 'Save'}
        </button>
        {canArchive && onArchive ? (
          <button
            type="button"
            disabled={formLocked}
            onClick={() => void onArchive()}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Archive
          </button>
        ) : null}
      </div>
    </form>
  );
}

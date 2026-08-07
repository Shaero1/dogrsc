'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { listDogs } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { slugify } from '@/lib/slug';
import { PhotoUploadField } from '@/components/admin/PhotoUploadField';
import {
  CreateStoryPayload,
  StoryAdmin,
  StoryContent,
  emptyStoryContent,
  sanitizeStoryContent,
} from '@/lib/stories-types';
import type { DogListItem } from '@/lib/dogs-types';

type LocaleKey = 'en' | 'th' | 'ru';

const MAX_COVER_BYTES = 5 * 1024 * 1024;

const LOCALES: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'th', label: 'Thai' },
  { key: 'ru', label: 'Russian' },
];

type StoryFormSubmitOptions = {
  pendingCover: File | null;
};

type StoryFormProps = {
  initial?: StoryAdmin;
  canDelete?: boolean;
  onSubmit: (
    payload: CreateStoryPayload,
    options?: StoryFormSubmitOptions,
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  onUploadCover?: (file: File) => Promise<void>;
  onDeleteCover?: (mediaId: string) => Promise<void>;
};

function isAllowedImageFile(file: File): boolean {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return true;
  }
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}

function validateCoverFile(file: File): string | null {
  if (!isAllowedImageFile(file)) {
    return 'Only JPEG, PNG, or WebP images are allowed.';
  }
  if (file.size > MAX_COVER_BYTES) {
    return 'Cover must be 5 MB or smaller.';
  }
  return null;
}

function mergeInitialContent(initial?: StoryAdmin): StoryContent {
  const base = emptyStoryContent();
  if (!initial?.content) return base;

  for (const locale of LOCALES) {
    const entry = initial.content[locale.key];
    if (entry) {
      base[locale.key] = {
        title: entry.title ?? '',
        body: entry.body ?? '',
      };
    }
  }

  return base;
}

export function StoryForm({
  initial,
  canDelete,
  onSubmit,
  onDelete,
  onUploadCover,
  onDeleteCover,
}: StoryFormProps) {
  const [tab, setTab] = useState<LocaleKey>('en');
  const [content, setContent] = useState<StoryContent>(() =>
    mergeInitialContent(initial),
  );
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [dogId, setDogId] = useState<string>(initial?.dogId ?? '');
  const [dogs, setDogs] = useState<DogListItem[]>([]);
  const [media, setMedia] = useState(initial?.media ?? []);
  const [pendingCover, setPendingCover] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingCoverRef = useRef(pendingCover);
  pendingCoverRef.current = pendingCover;

  const isCreateMode = !initial && !onUploadCover;
  const formLocked = loading || submitted || coverUploading;

  useEffect(() => {
    return () => {
      if (pendingCoverRef.current) {
        URL.revokeObjectURL(pendingCoverRef.current.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!initial) return;
    setContent(mergeInitialContent(initial));
    setSlug(initial.slug);
    setIsPublished(initial.isPublished);
    setDogId(initial.dogId ?? '');
    setMedia(initial.media);
  }, [initial]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    listDogs(token, { limit: 100, excludeArchived: true })
      .then((result) => setDogs(result.items))
      .catch(() => setDogs([]));
  }, []);

  function updateLocaleField(
    locale: LocaleKey,
    field: 'title' | 'body',
    value: string,
  ) {
    setContent((prev) => {
      const next = {
        ...prev,
        [locale]: { ...prev[locale], [field]: value },
      };

      if (locale === 'en' && field === 'title' && !slugTouched) {
        setSlug(slugify(value));
      }

      return next;
    });
  }

  function handleCoverSelect(files: FileList | null) {
    if (!files?.[0]) return;
    setError(null);

    const file = files[0];
    const validationError = validateCoverFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isCreateMode) {
      if (pendingCover) {
        URL.revokeObjectURL(pendingCover.previewUrl);
      }
      setPendingCover({
        file,
        previewUrl: URL.createObjectURL(file),
      });
      return;
    }

    if (!onUploadCover) return;

    setCoverUploading(true);
    onUploadCover(file)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Cover upload failed');
      })
      .finally(() => setCoverUploading(false));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: CreateStoryPayload = {
        slug: slug.trim() || undefined,
        content: sanitizeStoryContent(content),
        isPublished,
        dogId: dogId || null,
      };

      await onSubmit(payload, {
        pendingCover: pendingCover?.file ?? null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  const coverPreview =
    pendingCover?.previewUrl ?? media[0]?.url ?? null;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2">
        {LOCALES.map((locale) => (
          <button
            key={locale.key}
            type="button"
            onClick={() => setTab(locale.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === locale.key
                ? 'bg-amber-800 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {locale.label}
          </button>
        ))}
      </div>

      {LOCALES.map((locale) => (
        <div key={locale.key} className={tab === locale.key ? 'space-y-4' : 'hidden'}>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Title {locale.key === 'en' ? '(required)' : ''}
            </label>
            <input
              type="text"
              value={content[locale.key]?.title ?? ''}
              onChange={(event) =>
                updateLocaleField(locale.key, 'title', event.target.value)
              }
              disabled={formLocked}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Body {locale.key === 'en' ? '(required)' : ''}
            </label>
            <textarea
              rows={8}
              value={content[locale.key]?.body ?? ''}
              onChange={(event) =>
                updateLocaleField(locale.key, 'body', event.target.value)
              }
              disabled={formLocked}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            disabled={formLocked}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Linked dog (optional)
          </label>
          <select
            value={dogId}
            onChange={(event) => setDogId(event.target.value)}
            disabled={formLocked}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.nameEn ?? dog.slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
          disabled={formLocked}
        />
        Published on public site
      </label>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Cover image
        </label>
        {coverPreview ? (
          <div className="mt-2 max-w-sm overflow-hidden rounded-lg border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="" className="aspect-video w-full object-cover" />
          </div>
        ) : null}
        <div className="mt-2">
          <PhotoUploadField
            buttonLabel={coverPreview ? 'Change cover image' : 'Add cover image'}
            hint="JPEG, PNG, or WebP up to 5 MB."
            disabled={formLocked}
            resetInputAfterSelect
            onFilesSelected={(files) => handleCoverSelect(files)}
          />
        </div>
        {media[0] && onDeleteCover ? (
          <button
            type="button"
            onClick={() => onDeleteCover(media[0].id)}
            disabled={formLocked}
            className="mt-2 text-sm text-red-700 hover:underline"
          >
            Remove cover
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={formLocked}
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save story'}
        </button>
        {canDelete && onDelete ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={formLocked}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

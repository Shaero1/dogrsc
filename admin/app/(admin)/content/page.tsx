'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getContentPage, listContentPages, updateContentPage } from '@/lib/api';
import { getToken } from '@/lib/auth';
import {
  CONTENT_LOCALES,
  CONTENT_LOCALE_LABELS,
  type ContentItem,
  type ContentLocale,
  type ContentPageSummary,
} from '@/lib/content-types';

function buildDraftMap(
  fields: string[],
  items: ContentItem[],
): Record<ContentLocale, Record<string, string>> {
  const draft: Record<ContentLocale, Record<string, string>> = {
    en: {},
    th: {},
    ru: {},
  };

  for (const locale of CONTENT_LOCALES) {
    for (const field of fields) {
      const match = items.find(
        (item) => item.locale === locale && item.field === field,
      );
      draft[locale][field] = match?.value ?? '';
    }
  }

  return draft;
}

export default function ContentPage() {
  const [pages, setPages] = useState<ContentPageSummary[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [locale, setLocale] = useState<ContentLocale>('en');
  const [draft, setDraft] = useState<
    Record<ContentLocale, Record<string, string>>
  >({ en: {}, th: {}, ru: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId),
    [pages, selectedPageId],
  );

  async function loadPages() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const list = await listContentPages(token);
      setPages(list);
      if (!selectedPageId && list.length > 0) {
        setSelectedPageId(list[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }

  async function loadPageContent(entityId: string) {
    const token = getToken();
    if (!token || !entityId) return;

    setLoading(true);
    setError(null);

    try {
      const page = pages.find((item) => item.id === entityId);
      if (!page) {
        return;
      }

      const data = await getContentPage(token, entityId);
      setDraft(buildDraftMap(page.fields, data.items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPageId && pages.length > 0) {
      void loadPageContent(selectedPageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId, pages]);

  function updateField(field: string, value: string) {
    setDraft((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token || !selectedPage) return;

    setSaving(true);
    setError(null);
    setSavedAt(null);

    try {
      const items: ContentItem[] = [];
      for (const pageLocale of CONTENT_LOCALES) {
        for (const field of selectedPage.fields) {
          items.push({
            locale: pageLocale,
            field,
            value: draft[pageLocale][field] ?? '',
          });
        }
      }

      await updateContentPage(token, selectedPage.id, items);
      setSavedAt(new Date().toLocaleTimeString());
      await loadPageContent(selectedPage.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminHeader title="Content" />
      <div className="p-6">
        {error ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mb-6 flex flex-wrap items-end gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Page</span>
            <select
              value={selectedPageId}
              onChange={(event) => setSelectedPageId(event.target.value)}
              className="min-w-[220px] rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            {CONTENT_LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  locale === item
                    ? 'bg-amber-800 text-white'
                    : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {CONTENT_LOCALE_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : selectedPage ? (
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
            {selectedPage.fields.map((field) => (
              <label key={field} className="block text-sm">
                <span className="mb-1 block font-medium text-zinc-700">
                  {field}
                </span>
                <textarea
                  rows={field.includes('Body') || field.startsWith('story') ? 4 : 2}
                  value={draft[locale][field] ?? ''}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save all locales'}
              </button>
              {savedAt ? (
                <span className="text-sm text-zinc-500">Saved at {savedAt}</span>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}

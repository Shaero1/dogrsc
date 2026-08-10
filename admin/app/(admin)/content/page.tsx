'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CmsLocaleFieldsForm } from '@/components/admin/CmsLocaleFieldsForm';
import { getContentPage, listContentPages, updateContentPage } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { buildDraftMap, draftToContentItems } from '@/lib/cms-draft';
import {
  type ContentLocale,
  type ContentPageSummary,
} from '@/lib/content-types';

export default function ContentPage() {
  const [pages, setPages] = useState<ContentPageSummary[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [locale, setLocale] = useState<ContentLocale>('en');
  const [draft, setDraft] = useState(buildDraftMap([], []));
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
      await updateContentPage(
        token,
        selectedPage.id,
        draftToContentItems(selectedPage.fields, draft),
      );
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

        <div className="mb-6">
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
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : selectedPage ? (
          <CmsLocaleFieldsForm
            fields={selectedPage.fields}
            locale={locale}
            onLocaleChange={setLocale}
            draft={draft}
            onFieldChange={updateField}
            onSubmit={(event) => void handleSubmit(event)}
            saving={saving}
            savedAt={savedAt}
          />
        ) : null}
      </div>
    </>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CmsLocaleFieldsForm } from '@/components/admin/CmsLocaleFieldsForm';
import { getBankDetails, updateBankDetails } from '@/lib/api';
import {
  BANK_DETAIL_FIELDS,
  BANK_DETAIL_LABELS,
} from '@/lib/bank-details-types';
import { getToken } from '@/lib/auth';
import { buildDraftMap, draftToContentItems } from '@/lib/cms-draft';
import { type ContentLocale } from '@/lib/content-types';

export function BankDetailsPanel() {
  const [locale, setLocale] = useState<ContentLocale>('en');
  const [draft, setDraft] = useState(buildDraftMap([...BANK_DETAIL_FIELDS], []));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function loadBankDetails() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBankDetails(token);
      setDraft(buildDraftMap([...BANK_DETAIL_FIELDS], data.items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bank details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBankDetails();
  }, []);

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
    if (!token) return;

    setSaving(true);
    setError(null);
    setSavedAt(null);

    try {
      await updateBankDetails(
        token,
        draftToContentItems([...BANK_DETAIL_FIELDS], draft),
      );
      setSavedAt(new Date().toLocaleTimeString());
      await loadBankDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-zinc-600">
        Bank transfer details shown on the public donate page. Edit each locale
        separately — labels and values can include localized text.
      </p>

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <CmsLocaleFieldsForm
          fields={BANK_DETAIL_FIELDS}
          fieldLabels={BANK_DETAIL_LABELS}
          locale={locale}
          onLocaleChange={setLocale}
          draft={draft}
          onFieldChange={updateField}
          onSubmit={(event) => void handleSubmit(event)}
          saving={saving}
          savedAt={savedAt}
          textareaRows={(field) => (field === 'bankNote' ? 3 : 2)}
        />
      )}
    </>
  );
}

'use client';

import { FormEvent } from 'react';
import {
  CONTENT_LOCALES,
  CONTENT_LOCALE_LABELS,
  type ContentLocale,
} from '@/lib/content-types';

type CmsLocaleFieldsFormProps = {
  fields: readonly string[];
  fieldLabels?: Record<string, string>;
  locale: ContentLocale;
  onLocaleChange: (locale: ContentLocale) => void;
  draft: Record<ContentLocale, Record<string, string>>;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  savedAt: string | null;
  textareaRows?: (field: string) => number;
};

export function CmsLocaleFieldsForm({
  fields,
  fieldLabels,
  locale,
  onLocaleChange,
  draft,
  onFieldChange,
  onSubmit,
  saving,
  savedAt,
  textareaRows = (field) =>
    field.includes('Body') || field.startsWith('story') ? 4 : 2,
}: CmsLocaleFieldsFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <div className="flex gap-2">
        {CONTENT_LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onLocaleChange(item)}
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

      {fields.map((field) => (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">
            {fieldLabels?.[field] ?? field}
          </span>
          <textarea
            rows={textareaRows(field)}
            value={draft[locale][field] ?? ''}
            onChange={(event) => onFieldChange(field, event.target.value)}
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
  );
}

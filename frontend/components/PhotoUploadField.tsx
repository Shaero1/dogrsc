'use client';

import { useId, useState } from 'react';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

type PhotoUploadFieldProps = {
  name?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  buttonLabel: string;
  hint?: string;
  resetInputAfterSelect?: boolean;
  onFilesSelected?: (files: FileList | null) => void;
};

export function PhotoUploadField({
  name,
  accept = DEFAULT_ACCEPT,
  multiple,
  disabled,
  buttonLabel,
  hint,
  resetInputAfterSelect,
  onFilesSelected,
}: PhotoUploadFieldProps) {
  const id = useId();
  const [selectionLabel, setSelectionLabel] = useState<string | null>(null);

  return (
    <div>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const files = event.target.files;

          if (files && files.length > 0) {
            setSelectionLabel(
              files.length === 1
                ? files[0].name
                : `${files.length} files selected`,
            );
          } else {
            setSelectionLabel(null);
          }

          onFilesSelected?.(files);

          if (resetInputAfterSelect) {
            event.target.value = '';
            setSelectionLabel(null);
          }
        }}
      />
      <label
        htmlFor={id}
        aria-disabled={disabled}
        className={`inline-flex rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100 ${
          disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
        }`}
      >
        {buttonLabel}
      </label>
      {hint ? <p className="mt-2 text-sm text-zinc-600">{hint}</p> : null}
      {selectionLabel ? (
        <p className="mt-2 text-sm text-zinc-700">{selectionLabel}</p>
      ) : null}
    </div>
  );
}

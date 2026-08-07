type TranslationFn = (key: string) => string;

export function resolvePageFields(
  fields: readonly string[],
  cms: Record<string, string> | null,
  t: TranslationFn,
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const field of fields) {
    const cmsValue = cms?.[field];
    resolved[field] = cmsValue && cmsValue.length > 0 ? cmsValue : t(field);
  }

  return resolved;
}

export function field(
  content: Record<string, string>,
  key: string,
): string {
  return content[key] ?? '';
}

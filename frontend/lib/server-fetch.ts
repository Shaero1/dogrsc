const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * Server-side fetch with timeout so a dead API/DB does not block RSC for 30+ seconds.
 */
export async function serverFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API timeout (${timeoutMs}ms): ${String(input)}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

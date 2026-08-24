/**
 * Explicit signal for: backend is not reachable AND mock data is not permitted.
 *
 * Production recommendation: the frontend NEVER silently falls back to mock
 * data. Instead, components catch this and render a clear "Backend Not
 * Connected" state. This guarantees you cannot ship a demo-looking site with
 * stale hard-coded content and think the API is healthy when it isn't.
 */
export class BackendUnavailableError extends Error {
  public readonly code = 'BACKEND_UNAVAILABLE';
  public readonly retryAfter: number | null;
  public readonly endpoint: string | null;
  public readonly statusCode: number | null;

  constructor(
    message = 'The Growthbridge backend is not connected.',
    meta: {
      retryAfter?: number | null;
      endpoint?: string | null;
      statusCode?: number | null;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'BackendUnavailableError';
    this.retryAfter = meta.retryAfter ?? null;
    this.endpoint = meta.endpoint ?? null;
    this.statusCode = meta.statusCode ?? null;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, BackendUnavailableError);
    }
  }
}

export function isBackendUnavailable(
  err: unknown
): err is BackendUnavailableError {
  return (
    err instanceof BackendUnavailableError ||
    (typeof err === 'object' &&
      err !== null &&
      ((err as { code?: unknown }).code === 'BACKEND_UNAVAILABLE' ||
        (err as { code?: unknown }).code === 'BACKEND_REQUIRED'))
  );
}

/**
 * Signal for actions/features that explicitly require live backend services
 * and cannot function in mock or offline mode (e.g., live form submissions, payment, syncing).
 */
export class BackendRequiredError extends Error {
  public readonly code = 'BACKEND_REQUIRED';
  public readonly endpoint: string | null;

  constructor(
    message = 'This action requires a connected Growthbridge backend service.',
    meta: { endpoint?: string | null; cause?: unknown } = {}
  ) {
    super(message);
    this.name = 'BackendRequiredError';
    this.endpoint = meta.endpoint ?? null;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, BackendRequiredError);
    }
  }
}

export function isBackendRequired(err: unknown): err is BackendRequiredError {
  return (
    err instanceof BackendRequiredError ||
    (typeof err === 'object' &&
      err !== null &&
      (err as { code?: unknown }).code === 'BACKEND_REQUIRED')
  );
}


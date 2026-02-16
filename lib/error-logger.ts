/**
 * Structured error logging utility.
 * Outputs JSON in production for easier parsing by log aggregators.
 * Outputs readable format in development.
 */
export function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error instanceof Error ? error.message : String(error),
    ...(process.env.NODE_ENV === 'development' && error instanceof Error
      ? { stack: error.stack }
      : {}),
    ...metadata,
  };

  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(errorInfo));
  } else {
    console.error(`[${errorInfo.context}]`, errorInfo.message, metadata || '');
  }
}

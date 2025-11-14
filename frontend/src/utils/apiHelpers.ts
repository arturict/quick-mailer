/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
};

/**
 * Enhanced fetch with retry logic and better error handling
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryConfig - Retry configuration
 * @returns Promise with the response
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx), only on server errors (5xx) and network errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error, will retry
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      // Network error, will retry
      lastError = error instanceof Error ? error : new Error('Network error');
    }

    // Don't wait after the last attempt
    if (attempt < config.maxRetries) {
      const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Parse error response from API
 * 
 * @param response - The response object
 * @returns Error message
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const error = await response.json();
    return error.error || error.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Handle API errors with user-friendly messages
 * 
 * @param error - The error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 * 
 * @param error - The error object
 * @returns true if network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network');
  }
  
  return false;
}

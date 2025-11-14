import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWithRetry,
  parseErrorResponse,
  getErrorMessage,
  isNetworkError,
} from './apiHelpers';

describe('apiHelpers', () => {
  describe('fetchWithRetry', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return response on successful fetch', async () => {
      const mockResponse = new Response('success', { status: 200 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetchWithRetry('/test');
      expect(response).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on server error', async () => {
      const failResponse = new Response('error', { status: 500 });
      const successResponse = new Response('success', { status: 200 });
      
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(successResponse);

      const response = await fetchWithRetry('/test', undefined, {
        maxRetries: 3,
        retryDelay: 10,
      });

      expect(response).toBe(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client error (4xx)', async () => {
      const mockResponse = new Response('error', { status: 404 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetchWithRetry('/test');
      expect(response).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exceeded', async () => {
      const mockResponse = new Response('error', { status: 500 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(
        fetchWithRetry('/test', undefined, {
          maxRetries: 2,
          retryDelay: 10,
        })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should retry on network error', async () => {
      const successResponse = new Response('success', { status: 200 });
      
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce(successResponse);

      const response = await fetchWithRetry('/test', undefined, {
        maxRetries: 3,
        retryDelay: 10,
      });

      expect(response).toBe(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('parseErrorResponse', () => {
    it('should parse JSON error response', async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: 'Test error' }),
        { status: 400 }
      );

      const message = await parseErrorResponse(mockResponse);
      expect(message).toBe('Test error');
    });

    it('should handle response with message field', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Error message' }),
        { status: 400 }
      );

      const message = await parseErrorResponse(mockResponse);
      expect(message).toBe('Error message');
    });

    it('should fallback to status code on invalid JSON', async () => {
      const mockResponse = new Response('invalid json', { status: 500 });

      const message = await parseErrorResponse(mockResponse);
      expect(message).toBe('Request failed with status 500');
    });
  });

  describe('getErrorMessage', () => {
    it('should return message from Error object', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should return string error as is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown error', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
    });
  });

  describe('isNetworkError', () => {
    it('should identify TypeError with fetch message as network error', () => {
      const error = new TypeError('fetch failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify TypeError with network message as network error', () => {
      const error = new TypeError('network error');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify Error with network message as network error', () => {
      const error = new Error('Network timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should not identify other errors as network error', () => {
      expect(isNetworkError(new Error('Something else'))).toBe(false);
      expect(isNetworkError('error string')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });
});

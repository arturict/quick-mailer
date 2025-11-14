import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });

    // Should still be old value immediately
    expect(result.current).toBe('initial');

    // Wait for debounce to complete
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 }
    );
  });

  it('should handle non-string values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 123, delay: 100 },
      }
    );

    expect(result.current).toBe(123);

    rerender({ value: 456, delay: 100 });

    await waitFor(
      () => {
        expect(result.current).toBe(456);
      },
      { timeout: 200 }
    );
  });

  it('should handle objects', async () => {
    const obj1 = { name: 'John' };
    const obj2 = { name: 'Jane' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: obj1, delay: 100 },
      }
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 100 });

    await waitFor(
      () => {
        expect(result.current).toBe(obj2);
      },
      { timeout: 200 }
    );
  });
});

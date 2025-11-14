import { useEffect } from 'react';

/**
 * Configuration for a keyboard shortcut
 */
interface KeyboardShortcut {
  /** The key to press */
  key: string;
  /** Whether Ctrl (or Cmd on Mac) must be pressed */
  ctrl?: boolean;
  /** Whether Shift must be pressed */
  shift?: boolean;
  /** Whether Alt must be pressed */
  alt?: boolean;
  /** The callback function to execute when the shortcut is triggered */
  callback: () => void;
  /** Human-readable description of what the shortcut does */
  description: string;
}

/**
 * Hook that sets up keyboard shortcuts for the component
 * 
 * @param shortcuts - Array of keyboard shortcut configurations
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 's',
 *     ctrl: true,
 *     callback: () => handleSave(),
 *     description: 'Save document'
 *   }
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, shift, alt, callback }) => {
        const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts used throughout the application
 */
export const commonShortcuts = {
  compose: { key: 'c', ctrl: true, description: 'Compose new email' },
  templates: { key: 't', ctrl: true, description: 'View templates' },
  history: { key: 'h', ctrl: true, description: 'View history' },
  send: { key: 'Enter', ctrl: true, description: 'Send email' },
  escape: { key: 'Escape', description: 'Close dialog/Cancel' },
};

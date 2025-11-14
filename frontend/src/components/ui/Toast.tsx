import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Toaster component with accessibility support
 * Renders toast notifications with ARIA live regions
 */
export const Toaster = HotToaster;

/**
 * Toast notification utilities
 * Provides success, error, info, and warning toast notifications
 * with automatic dismissal and accessibility support
 */
export const showToast = {
  /**
   * Show a success toast notification
   * @param message - The message to display
   */
  success: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0" aria-hidden="true">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-base-content">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-base-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  },

  /**
   * Show an error toast notification
   * @param message - The error message to display
   */
  error: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0" aria-hidden="true">
              <XCircle className="h-6 w-6 text-error" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-base-content">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-base-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
    });
  },

  /**
   * Show an info toast notification
   * @param message - The info message to display
   */
  info: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0" aria-hidden="true">
              <Info className="h-6 w-6 text-info" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-base-content">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-base-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  },

  /**
   * Show a warning toast notification
   * @param message - The warning message to display
   */
  warning: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0" aria-hidden="true">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-base-content">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-base-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  },
};

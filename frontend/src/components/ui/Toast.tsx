import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export const Toaster = HotToaster;

export const showToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  },

  error: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
    });
  },

  info: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 3000,
    });
  },

  warning: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-down' : 'opacity-0'
        } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content focus:outline-none"
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

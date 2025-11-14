import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * ErrorBoundary component catches React errors in child components
 * and displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-2xl w-full">
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-error/10 rounded-full">
                  <AlertTriangle className="w-16 h-16 text-error" />
                </div>
              </div>
              
              <h2 className="card-title justify-center text-2xl mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="text-base-content/70 mb-4">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {this.state.error && (
                <div className="bg-base-200 p-4 rounded-lg text-left mb-4">
                  <p className="font-mono text-sm text-error break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="card-actions justify-center gap-2">
                <button
                  className="btn btn-primary gap-2"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>

              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="bg-base-200 p-4 rounded-lg text-xs overflow-auto max-h-64">
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

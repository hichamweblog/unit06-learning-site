import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="error-fallback" role="alert">
          <div className="error-fallback__icon" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="error-fallback__title">حدث خطأ غير متوقع</h1>
          {isDev && this.state.error && (
            <pre className="error-fallback__message" dir="ltr">
              {this.state.error.message || String(this.state.error)}
            </pre>
          )}
          <button
            type="button"
            className="error-fallback__action button"
            onClick={this.handleReload}
          >
            حاول مرة أخرى
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

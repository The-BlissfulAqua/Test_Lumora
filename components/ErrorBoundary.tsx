import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State;

  // Switched from a class property initializer to a constructor for setting initial state.
  // This is a more robust pattern for class components and resolves a TypeScript issue
  // where `this.props` was not being correctly recognized on the component instance.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-navy-dark text-slate-light">
          <h1 className="text-4xl font-bold text-red-500 mb-4">System Malfunction</h1>
          <p className="text-lg text-slate-dark">A critical error has occurred. Please refresh the page or contact support.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
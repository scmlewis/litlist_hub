"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-mesh">
          <div className="glass-card rounded-2xl p-8 max-w-lg w-full border-primary-700 text-center">
            <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-primary-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-primary-300 mb-2">
              We're sorry, but something unexpected happened.
            </p>
            {this.state.error && (
              <details className="text-left mt-4 p-4 bg-primary-950 rounded-lg border border-primary-800">
                <summary className="text-sm text-primary-400 cursor-pointer hover:text-primary-300">
                  Error details
                </summary>
                <p className="text-xs text-red-400 mt-2 font-mono break-all">
                  {this.state.error.message}
                </p>
              </details>
            )}
            <div className="flex gap-3 mt-6 justify-center">
              <Button
                onClick={this.retry}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="border-primary-700 text-primary-300 hover:text-primary-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

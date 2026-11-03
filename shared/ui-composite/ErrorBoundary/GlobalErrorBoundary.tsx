'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logError } from '@/shared/utils/errorLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary - Catches all errors in the application
 * Wraps the entire app to prevent crashes
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Update state when error is caught
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, errorInfo, {
      boundary: 'global',
    });
  }

  // Reset error state
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Show error fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          type='global'
        />
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

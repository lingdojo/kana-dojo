'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  gameName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Game Error Boundary - Catches errors in game components
 * Prevents game crashes from affecting the entire app
 */
export class GameErrorBoundary extends Component<Props, State> {
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

  // Log error information
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { gameName } = this.props;

    // Log to console with game context
    console.error(
      `Game Error Boundary (${gameName || 'Unknown'}) caught an error:`,
      error,
      errorInfo,
    );

    // TODO: Send to error tracking service with game context
    // logErrorToService(error, { ...errorInfo, gameName });
  }

  // Reset error state and restart game
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Show game-specific error fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          type='game'
        />
      );
    }

    // Render game normally if no error
    return this.props.children;
  }
}

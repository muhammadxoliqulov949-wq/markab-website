'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Name of this boundary for easier debugging (logged on error). */
  name?: string;
  /** Rendered instead of `children` when a child throws. */
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
};

type State = { error: Error | null };

/**
 * Lightweight class-based error boundary. We keep this file small and
 * dependency-free so it can wrap any interactive subtree (map, calculator,
 * phone demo) without pulling extra JS into the rest of the tree.
 *
 * Server Components cannot be wrapped directly — place this at the seam
 * between the server tree and a client-only island that may throw.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook for future monitoring (Sentry, Datadog …). For now just log so the
    // error is not swallowed silently during development.
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback({ error: this.state.error, reset: this.reset })
        : this.props.fallback;
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-5 text-sm"
      >
        <p className="font-semibold text-ink-900">Bu qismni yuklab bo‘lmadi</p>
        <p className="text-ink-500">
          Kutilmagan xato yuz berdi. Internet aloqasini tekshirib, qayta urinib ko‘ring.
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="inline-flex h-10 items-center rounded-btn bg-brand-600 px-4 text-sm font-semibold text-white transition-ctrl hover:bg-brand-700"
        >
          Qayta urinish
        </button>
      </div>
    );
  }
}

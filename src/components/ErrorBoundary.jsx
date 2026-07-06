import { Component } from 'react';

/**
 * Top-level error boundary. Without one, any render-time exception
 * unmounts the entire React tree and leaves the user staring at a
 * white page with no way back except a manual reload.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ProPath] Uncaught render error', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: '#1C1C1C' }}
      >
        <p className="text-lg font-semibold mb-2" style={{ color: '#A58D69' }}>
          Something went wrong
        </p>
        <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
          The app hit an unexpected error. Your data is safe — reload to continue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#A58D69', color: '#fff' }}
        >
          Reload
        </button>
      </div>
    );
  }
}

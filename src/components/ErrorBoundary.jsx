import { Component } from 'react';

// After a deploy, the page an open tab is running still points at the OLD file names; the server no longer has
// them, so the next screen that loads lazily fails with one of these. A reload fetches the new version.
const STALE_CHUNK = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS/i;

/** Reload once to pick up a new deploy. Returns false if we already tried in the last minute (so a real fault can't loop). */
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem('propath_stale_reload') || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem('propath_stale_reload', String(Date.now()));
  } catch (_) { /* storage blocked — still allow one reload */ }
  window.location.reload();
  return true;
}

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
    if (STALE_CHUNK.test(String(error?.message || error))) reloadForNewVersion();
  }

  render() {
    if (!this.state.error) return this.props.children;
    const detail = String(this.state.error?.message || this.state.error).slice(0, 300);
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
        {/* Small print for whoever is fixing it: what actually broke. */}
        <p className="text-[11px] mt-8 max-w-md break-words" style={{ color: '#6b7280' }}>{detail}</p>
      </div>
    );
  }
}

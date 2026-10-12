import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Reload
          </button>
        </div>
      </div>
    );
  }
}

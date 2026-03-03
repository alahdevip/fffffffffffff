
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 🛡️ GLOBAL ERROR BOUNDARY (Prevent White/Black Screen of Death)
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL APP CRASH:", error, errorInfo);
    // Auto-recovery: Clear cache if crash happens
    if (localStorage.getItem('stalkea_crash_count')) {
      localStorage.clear();
      sessionStorage.clear();
    } else {
      localStorage.setItem('stalkea_crash_count', '1');
    }
  }

  render() {
    if (this.state.hasError) {
      localStorage.clear();
      window.location.href = '/';
      return null;
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

// 🚀 SEM StrictMode em produção: elimina double-renders que destroem FPS
// StrictMode causa DOIS renders de cada componente — inaceitável para 60fps
const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

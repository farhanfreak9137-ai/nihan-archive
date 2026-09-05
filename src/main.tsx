import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#0b0d10',
            color: '#f0f6fc',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#ff7b72' }}>
            Application Error
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: '#8b949e',
              maxWidth: '400px',
              marginBottom: '16px',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred while launching.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#21262d',
              color: '#fff',
              border: '1px solid #30363d',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global safety net for unhandled runtime errors
window.addEventListener('error', (event) => {
  console.error('Global window error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('partdrive_user');
      localStorage.removeItem('partdrive_profile');
      localStorage.removeItem('partdrive_requests');
      localStorage.removeItem('partdrive_my_sent_offers');
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            color: '#F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>
            Страница обновлена
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', marginBottom: '24px', lineHeight: 1.5 }}>
            Система синхронизировала новые данные. Нажмите кнопку ниже, чтобы продолжить.
          </p>

          <button
            onClick={this.handleReset}
            style={{
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            <RefreshCw size={18} /> Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

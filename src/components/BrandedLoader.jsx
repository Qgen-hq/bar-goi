import React from 'react';
import { Zap } from 'lucide-react';

export default function BrandedLoader({ text, lang }) {
  const defaultText = lang === 'kz' ? 'bar.go жүктелуде...' : 'Загрузка bar.go...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '16px' }}>
        {/* Outer Pulsing Emerald Ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '20px',
          border: '3px solid var(--primary-emerald)',
          animation: 'pulseGlow 1.8s infinite cubic-bezier(0.4, 0, 0.6, 1)'
        }} />

        {/* Center Logo Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--primary-emerald)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px var(--primary-emerald-glow)'
        }}>
          <Zap size={32} fill="#FFFFFF" />
        </div>
      </div>

      <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '4px' }}>
        bar<span style={{ color: 'var(--primary-emerald)' }}>.go</span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
        {text || defaultText}
      </div>
    </div>
  );
}

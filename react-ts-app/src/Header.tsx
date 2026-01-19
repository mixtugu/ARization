import React from 'react';

const Header: React.FC = () => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        boxSizing: 'border-box',
        padding: '14px 20px',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef3ff 45%, #ffffff 100%)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: '1024px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          onClick={() => {
            window.location.href = '/';
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            AR化
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.08em',
            }}
          >
            STUDIO
          </span>
        </div>

        {/* Right meta */}
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          Web-based AR Preview
        </div>
      </div>
    </header>
  );
};

export default Header;
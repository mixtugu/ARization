import React from 'react';

const Header: React.FC = () => {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 24px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top row: logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          AR化
        </div>
      </div>

      {/* Bottom black line */}
      <div
        style={{
          marginTop: '12px',
          width: '100%',
          height: '2px',
          backgroundColor: '#000',
        }}
      />
    </header>
  );
};

export default Header;
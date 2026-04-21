import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          <div className="app-header__title">AR化</div>
          <span className="app-header__subtitle">STUDIO</span>
        </Link>

        <div className="app-header__actions">
          <Link to="/upload" className="app-header__link">
            Upload
          </Link>
          <Link to="/library" className="app-header__link">
            Library List
          </Link>
          <img src="/wtnv.svg" alt="WTNV" className="app-header__logo" />
        </div>
      </div>
    </header>
  );
};

export default Header;

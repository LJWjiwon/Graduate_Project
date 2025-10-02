import React from 'react';
import './header.css';

const Header = ({left, center}) => {
  return (
    <header className="app-header">
      {left}

      {center}

      <button className="header-button icon-user">
        <span>👤</span>
      </button>
    </header>
  );
};

export default Header;
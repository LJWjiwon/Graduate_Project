import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="detail-floating-buttons">
        <button className="fab-detail">
          <span className="fab-icon">+</span>
          <span>일정 추가</span>
        </button>
        <button className="fab-detail">
          <span className="fab-icon">📆</span>
          <span>일정 관리</span>
        </button>
      </footer>
  );
};

export default Footer;
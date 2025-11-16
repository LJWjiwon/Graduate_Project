import React from 'react';
import './footer.css';
import { useNavigate } from 'react-router-dom';

const Footer = ({ onOpenModalClick }) => {
  const navigate = useNavigate();

  return (
    <footer className="detail-floating-buttons">
        <button className="fab-detail" onClick={onOpenModalClick}>
          <span className="fab-icon">+</span>
          <span>일정 추가</span>
        </button>
        <button className="fab-detail" onClick={() => navigate('/manage')}>
          <span className="fab-icon">📆</span>
          <span>일정 관리</span>
        </button>
      </footer>
  );
};

export default Footer;
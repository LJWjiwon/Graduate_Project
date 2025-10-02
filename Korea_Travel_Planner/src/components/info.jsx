import React from 'react';
import './Info.css';

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children }) => <div className={className}>{children}</div>;

const Info = () => {
  return (
    <div className="place-detail-container">
      <header className="detail-header">
        <Icon className="header-icon back-arrow">{'<'}</Icon>
        <div className="search-bar-detail">
          <input type="text" placeholder="Search anything...." />
          <Icon className="header-icon search-icon">🔍</Icon>
        </div>
        <Icon className="header-icon user-profile">👤</Icon>
      </header>

      <main className="detail-main-content">
        <div className="image-placeholder"></div>
        <div className="info-section">
          <h1 className="place-title">부산 씨라이프 아쿠아리움</h1>
          <div className="description-box">
            <p>블라블라</p>
            <p>블라</p>
            <p>블라ㅏㅏ</p>
          </div>
        </div>
      </main>

      <footer className="detail-floating-buttons">
        <button className="fab-detail">
          <span className="fab-icon">+</span>
          <span>일정 추가</span>
        </button>
        <button className="fab-detail">
          <span className="fab-icon">+</span>
          <span>일정 관리</span>
        </button>
      </footer>
    </div>
  );
};

export default Info;
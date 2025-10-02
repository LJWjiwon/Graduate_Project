import React from 'react';
import './Info.css';
import Header from './header.jsx';
import Footer from './footer.jsx';

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children }) => <div className={className}>{children}</div>;

const Info = () => {
  return (
    <div className="place-detail-container">
      <Header
        left = {<button className="header-button icon-back">
          {'<'}
        </button>}
        center  = {<div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search anything...." 
          />
          <span className="search-icon-span">🔍</span>
        </div>}
      >
      </Header> 

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

      <Footer />
    </div>
  );
};

export default Info;
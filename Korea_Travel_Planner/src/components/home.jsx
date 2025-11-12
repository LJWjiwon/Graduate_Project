import React from 'react';
import './home.css';
import Footer from './footer.jsx';

// 아이콘을 간단한 컴포넌트로 만듭니다. 실제 프로젝트에서는 SVG 아이콘 라이브러리를 사용하는 것이 좋습니다.
const Icon = ({ name, children }) => <div className={`icon ${name}`}>{children}</div>;

// 여행지 카드 컴포넌트
const TravelCard = ({ rank, title }) => (
  <div className="travel-card">
    <div className="card-rank">{rank}</div>
    <div className="card-image-placeholder"></div>
    <p className="card-title">{title}</p>
  </div>
);

// 메인 페이지 컴포넌트
const Home = () => {
  // 예시 데이터
  const topDestinations = [
    { id: 1, title: '부산 씨라이프 아쿠아리움' },
    { id: 2, title: '부산 씨라이프 아쿠아리움' },
    { id: 3, title: '부산 씨라이프 아쿠아리움' },
    { id: 4, title: '부산 씨라이프 아쿠아리움' },
  ];

  const petFriendlyDestinations = [
    { id: 1, title: '부산 씨라이프 아쿠아리움' },
    { id: 2, title: '부산 씨라이프 아쿠아리움' },
    { id: 3, title: '부산 씨라이프 아쿠아리움' },
    { id: 4, title: '부산 씨라이프 아쿠아리움' },
  ];

  return (
    <div className="container">
      <header className="header">
        <div className="location-selector">
          <Icon name="location-icon">📍</Icon>
          <span>부산광역시 북구</span>
          <Icon name="dropdown-arrow">▾</Icon>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search anything..." />
          <Icon name="search-icon">🔍</Icon>
        </div>
        <div className="user-profile">
          <Icon name="user-icon">👤</Icon>
        </div>
      </header>
      

      <section className="hero-image-placeholder"></section>

      <main className="content-area">
        <section className="destination-section">
          <div className="section-header">
            <h2>부산 TOP 50 여행지</h2>
            <Icon name="filter-icon">🎚️</Icon>
          </div>
          <div className="card-list">
            {topDestinations.map(dest => (
              <TravelCard key={dest.id} rank={dest.id} title={dest.title} />
            ))}
          </div>
        </section>

        <section className="destination-section">
          <div className="section-header">
            <h2>반려동물 동반 여행지</h2>
          </div>
          <div className="card-list">
            {petFriendlyDestinations.map(dest => (
              <TravelCard key={dest.id} rank={dest.id} title={dest.title} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
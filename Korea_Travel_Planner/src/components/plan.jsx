import React, { useState } from 'react';
import './plan.css';

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children }) => <div className={className}>{children}</div>;

// 예시 데이터
const itineraryData = {
  day1: [
    { id: 1, name: '부산 아쿠아리움', time: '2025.04.17. 09:00', travel: { mode: 'car', duration: '45분' } },
    { id: 2, name: '부산 아쿠아리움', time: '2025.04.17. 11:00', travel: null },
  ],
  day2: [
    { id: 3, name: '해운대 해수욕장', time: '2025.04.18. 10:00', travel: { mode: 'walk', duration: '15분' } },
    { id: 4, name: '더베이 101', time: '2025.04.18. 12:00', travel: null },
  ]
};


const Plan = () => {
  const [currentDay, setCurrentDay] = useState(1);

  const handleDayChange = (direction) => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === 'next') {
      setCurrentDay(currentDay + 1);
    }
  };

  const currentItinerary = itineraryData[`day${currentDay}`] || [];

  return (
    <div className="trip-plan-container">
      <header className="trip-plan-header">
        <Icon className="header-icon back-arrow">{'<'}</Icon>
        <h2>부산 반려동물 여행 계획</h2>
        <Icon className="header-icon user-profile">👤</Icon>
      </header>

      <div className="trip-plan-body">
        {/* 왼쪽: 지도 영역 */}
        <div className="map-area">
          <div className="map-controls">
            <div className="location-display">◎ 부산광역시 북구 ⌄</div>
            <div className="search-bar-map">
              <input type="text" placeholder="Search place..." />
            </div>
          </div>
          {/* 지도 API 대신 색상으로 채운 div */}
          <div className="map-placeholder"></div>
        </div>

        {/* 오른쪽: 일정 사이드바 */}
        <aside className="itinerary-sidebar">
          <div className="sidebar-header">
            <div className="day-navigation">
              <button onClick={() => handleDayChange('prev')}>&lt;</button>
              <span>{currentDay}일차</span>
              <button onClick={() => handleDayChange('next')}>&gt;</button>
            </div>
            <button className="save-button">저장</button>
          </div>

          <ul className="itinerary-list">
            {currentItinerary.map((item, index) => (
              <React.Fragment key={item.id}>
                <li className="itinerary-item">
                  <div className="item-content">
                    <div className="item-number">{index + 1}.</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-time">{item.time}</div>
                    </div>
                  </div>
                  <Icon className="item-icon">📋</Icon>
                </li>
                {item.travel && (
                   <div className="travel-info">
                     <span className="travel-icon">🚗</span>
                     <span>자동차 {item.travel.duration}</span>
                   </div>
                )}
              </React.Fragment>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Plan;
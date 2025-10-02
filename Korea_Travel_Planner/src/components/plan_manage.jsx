import React from 'react';
import './plan_manage.css';

// 예시 데이터 배열
const scheduleData = [
  {
    id: 1,
    title: '부산 반려동물 여행 계획',
    dateRange: '2025.04.17 ~ 2025.04.18',
    duration: '2일',
  },
  {
    id: 2,
    title: '힐링 여행!',
    dateRange: '2025.04.17 ~ 2025.04.17',
    duration: '1일',
  },
];

// 개별 일정 아이템 컴포넌트
const ScheduleItem = ({ title, dateRange, duration }) => {
  return (
    <div className="schedule-item">
      <div className="schedule-info">
        <h3 className="schedule-title">{title}</h3>
        <p className="schedule-date">{`${dateRange} (${duration})`}</p>
      </div>
      <div className="schedule-actions">
        <button className="icon-button">✏️</button>
        <button className="icon-button">🗑️</button>
      </div>
    </div>
  );
};


const Manage = () => {
  return (
    <div className="schedule-container">
      <header className="schedule-header">
        <div className="header-icon back-icon">{'<'}</div>
        <h1>일정 관리</h1>
        <div className="header-icon user-icon">👤</div>
      </header>
      
      <main className="schedule-main">
        <div className="add-schedule-wrapper">
            <button className="add-schedule-button">
                <span className="add-icon">+</span>
                일정 추가
            </button>
        </div>
        
        <div className="schedule-list">
          {scheduleData.map(item => (
            <ScheduleItem 
              key={item.id}
              title={item.title}
              dateRange={item.dateRange}
              duration={item.duration}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Manage;
import React from 'react';
import './plan_manage.css';
import Header from './header.jsx';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <div className="schedule-container">
      <Header
        left = {<button className="header-button icon-back" onClick={() => navigate('/home')}>
          {'<'}
        </button>}
        center  = {<h3>일정 관리</h3>}
      >
      </Header> 
      
      <main className="schedule-main">
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
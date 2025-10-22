/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import './plan.css';
import Map from './KakaoMap.jsx';

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children }) => <div className={className}>{children}</div>;

// [수정] 샘플 데이터 제거 -> 빈 객체 {} 로 시작
const Plan = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [itineraryState, setItineraryState] = useState({}); // 빈 객체로 시작

  const handleDayChange = (direction) => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === 'next') {
      const nextDayKey = `day${currentDay + 1}`;
      if (!itineraryState[nextDayKey]) {
        setItineraryState(prev => ({ ...prev, [nextDayKey]: [] }));
      }
      setCurrentDay(currentDay + 1);
    }
  };

  const handleAddPlaceToItinerary = (place) => {
    const newItem = {
      id: place.id,
      name: place.place_name,
      // [수정] time 초기값을 null 또는 빈 문자열로 설정 (선택되지 않음 표시)
      time: null
    };
    const dayKey = `day${currentDay}`;

    setItineraryState(prevState => {
      const currentDayList = prevState[dayKey] || [];
      if (currentDayList.some(item => item.id === newItem.id)) {
        alert("이미 추가된 장소입니다.");
        return prevState;
      }
      const newDayList = [...currentDayList, newItem];
      return { ...prevState, [dayKey]: newDayList };
    });
    alert(`'${newItem.name}' 장소를 ${currentDay}일차에 추가했습니다.`);
  };

  const handleAddMemo = (itemId) => {
    alert(`(ID: ${itemId}) 항목에 메모를 추가합니다.`);
    // TODO: 메모 추가 로직 구현
  };

  // [신규] 날짜/시간 변경 핸들러 함수
  const handleTimeChange = (itemId, newTimeValue) => {
    const dayKey = `day${currentDay}`;
    setItineraryState(prevState => {
      // 현재 날짜의 리스트를 찾아서
      const currentDayList = prevState[dayKey] || [];
      // 해당 아이템의 time 값만 업데이트한 새 리스트 생성
      const updatedDayList = currentDayList.map(item =>
        item.id === itemId ? { ...item, time: newTimeValue } : item
      );
      // 전체 state 복사 후 현재 날짜 리스트만 교체
      return { ...prevState, [dayKey]: updatedDayList };
    });
  };

  const currentItinerary = itineraryState[`day${currentDay}`] || [];

  return (
    <div className="trip-plan-container">
      <header className="trip-plan-header">
        <Icon className="header-icon back-arrow">{'<'}</Icon>
        <h2>부산 반려동물 여행 계획</h2>
        <Icon className="header-icon user-profile">👤</Icon>
      </header>

      <div className="trip-plan-body">
        <div className="map-area">
          <Map onAddPlace={handleAddPlaceToItinerary} />
        </div>

        <aside className="itinerary-sidebar">
          <div className="sidebar-header">
            <div className="day-navigation">
              <button onClick={() => handleDayChange('prev')} disabled={currentDay === 1}>&lt;</button>
              <span>{currentDay}일차</span>
              <button onClick={() => handleDayChange('next')}>&gt;</button>
            </div>
            <button className="save-button">저장</button>
          </div>

          <ul className="itinerary-list">
          {currentItinerary.length === 0 && (
            <li className="itinerary-item empty">일정을 추가해 주세요.</li>
          )}

            {currentItinerary.map((item, index) => (
              <React.Fragment key={item.id}>
                <li className="itinerary-item">
                  <div className="item-content">
                    <div className="item-number">{index + 1}.</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      
                      {/* [핵심 수정] 시간 표시 -> datetime-local input으로 변경 */}
                      <input
                        type="datetime-local"
                        className="item-time-input" // CSS 스타일링을 위한 클래스
                        value={item.time || ''} // 값이 null이면 빈 문자열로
                        onChange={(e) => handleTimeChange(item.id, e.target.value)}
                        // placeholder="날짜 및 시간 설정" // 필요하다면 플레이스홀더 추가
                      />

                    </div>
                  </div>
                  <Icon className="item-icon">📋</Icon>
                </li>
              
                <div className="memo-container">
                  <button
                  className="add-memo-btn"
                  onClick={() => handleAddMemo(item.id)}
                >
                  메모 추가 📝
                </button>
                </div>
              </React.Fragment>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Plan;
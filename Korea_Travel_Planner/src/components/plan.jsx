/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import './plan.css';
import Map from './KakaoMap.jsx';

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children, onClick }) => (
  <div className={className} onClick={onClick}> 
    {children}
  </div>
);

// [수정] 샘플 데이터 제거 -> 빈 객체 {} 로 시작
const Plan = () => {
  const [currentDay, setCurrentDay] = useState(1);
// [!!신규!!] 1일차 날짜를 별도 state로 관리
  const [startDate, setStartDate] = useState(null);
  const [itineraryState, setItineraryState] = useState({
    day1: { places: [] }  // places만 관리
  }); 
  //맵을 이동시킬 타겟 좌표 state
  const [panTarget, setPanTarget] = useState(null);
  // [!!신규!!] 현재 수정 중인 메모의 ID를 저장하는 state
  const [editingMemoId, setEditingMemoId] = useState(null);

  const handleDayChange = (direction) => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === 'next') {
      const nextDayKey = `day${currentDay + 1}`;
      if (!itineraryState[nextDayKey]) {
        setItineraryState(prev => ({
           ...prev, 
           [nextDayKey]: { places: [] }
          }));
      }
      setCurrentDay(currentDay + 1);
    }
  };

  const handleAddPlaceToItinerary = (place) => {
    const newItem = {
      ...place, // <-- 1. place 객체의 모든 속성을 복사 (id, place_name, y, x 등)
      name: place.place_name, // 2. 'name' 속성을 'place_name'으로 통일 (선택 사항이지만 권장)
      time: null, // <-- 3. 'time' 속성 추가
      memo: ''
    };
    const dayKey = `day${currentDay}`;

    setItineraryState(prevState => {
      // [!!수정!!] state 업데이트 로직 (단순화)
      const currentDayData = prevState[dayKey] || { places: [] };
      const currentDayList = currentDayData.places;

      if (currentDayList.some(item => item.id === newItem.id)) {
        alert("이미 추가된 장소입니다.");
        return prevState;
      }
      const newDayList = [...currentDayList, newItem];
      
      return { 
        ...prevState, 
        [dayKey]: { places: newDayList } // date 속성 없이 places만 업데이트
      };
    });
    alert(`'${newItem.name}' 장소를 ${currentDay}일차에 추가했습니다.`);
  };

  // [!!신규!!] 메모 텍스트 클릭 시 input으로 변경
  const handleMemoClick = (itemId) => {
    setEditingMemoId(itemId);
  };
  
  // [!!신규!!] 메모 수정 완료 (포커스 아웃 또는 Enter)
  const handleMemoEditEnd = () => {
    setEditingMemoId(null);
  };

  // [!!수정!!] 메모 변경 핸들러 (state 구조 변경 대응)
  const handleMemoChange = (itemId, newMemoValue) => {
    const dayKey = `day${currentDay}`;
    setItineraryState(prevState => {
      const currentDayData = prevState[dayKey] || { places: [] };
      const updatedDayList = currentDayData.places.map(item =>
        item.id === itemId ? { ...item, memo: newMemoValue } : item
      );
      return { 
        ...prevState, 
        [dayKey]: { places: updatedDayList } 
      };
    });
  };

// [!!수정!!] 시간 변경 핸들러 (state 구조 변경 대응)
  const handleTimeChange = (itemId, newTimeValue) => {
    const dayKey = `day${currentDay}`;
    setItineraryState(prevState => {
      const currentDayData = prevState[dayKey] || { places: [] };
      const updatedDayList = currentDayData.places.map(item =>
        item.id === itemId ? { ...item, time: newTimeValue } : item
      );
      return { 
        ...prevState, 
        [dayKey]: { places: updatedDayList } 
      };
    });
  };

  // [!!신규!!] 일정 항목 클릭 시 맵 이동을 위한 핸들러
  const handlePanToMap = (item) => {
    // item에 y, x 좌표가 있는지 확인 (handleAddPlaceToItinerary에서 ...place로 복사했기 때문에 있어야 함)
    if (item.y && item.x) {
        setPanTarget(item); // panTarget state를 클릭한 장소 정보로 업데이트
    } else {
        console.error("이동할 좌표 정보가 없습니다:", item);
    }
  };

  // [!!신규!!] 장소 삭제 핸들러
  const handleDeletePlace = (itemIdToDelete) => {
    const dayKey = `day${currentDay}`;
    
    if (!window.confirm("이 장소를 일정에서 삭제하시겠습니까?")) {
      return;
    }

    setItineraryState(prevState => {
      // 1. 현재 날짜의 데이터를 가져옴
      const currentDayData = prevState[dayKey] || { places: [] };
      
      // 2. filter를 사용해 해당 id를 가진 항목을 "제외한" 새 배열 생성
      const updatedDayList = currentDayData.places.filter(
        item => item.id !== itemIdToDelete
      );
      
      // 3. state 업데이트
      return { 
        ...prevState, 
        [dayKey]: { places: updatedDayList } 
      };
    });
  };

// [!!수정!!] 1. state에서 장소 목록 가져오기
  const dayKey = `day${currentDay}`;
  const currentDayData = itineraryState[dayKey] || { places: [] };
  const currentItinerary = currentDayData.places;

// [!!신규!!] 2. 현재 일차의 날짜 계산하기
  let currentDayDate = null;
  if (startDate) {
    try {
      // 'YYYY-MM-DD' 문자열을 안전하게 Date 객체로 변환 (Timezone 문제 방지)
      const parts = startDate.split('-').map(Number);
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]); // 년, 월(0부터 시작), 일
      
      // 현재 일차(currentDay)에 맞게 날짜 더하기 (1일차는 0일 더함)
      dateObj.setDate(dateObj.getDate() + (currentDay - 1));

      // 'YYYY-MM-DD' 형식으로 다시 포맷
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      currentDayDate = `${year}-${month}-${day}`;

    } catch (e) {
      console.error("날짜 계산 오류:", e);
      currentDayDate = "날짜 오류"; // 오류 발생 시
    }
  }

  return (
    <div className="trip-plan-container">
      <header className="trip-plan-header">
        <Icon className="header-icon back-arrow">{'<'}</Icon>
        <h2>부산 반려동물 여행 계획</h2>
        <Icon className="header-icon user-profile">👤</Icon>
      </header>

      <div className="trip-plan-body">
        <div className="map-area">
          <Map 
            onAddPlace={handleAddPlaceToItinerary}
            currentDayPlaces={currentItinerary}
            panTarget={panTarget}
          />
        </div>

        <aside className="itinerary-sidebar">
          <div className="sidebar-header">
            <div className="day-navigation">
              <button onClick={() => handleDayChange('prev')} disabled={currentDay === 1}>&lt;</button>
              <span>{currentDay}일차</span>
              {currentDay === 1 ? (
                // 1일차: 날짜 "입력" (활성화)
                <input
                  type="date"
                  className="day-date-input"
                  value={startDate || ''}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              ) : (
                // 2일차부터: 계산된 날짜를 "고정 표시" (비활성화)
                <input
                  type="date"
                  className="day-date-input" // 1일차와 동일한 클래스
                  value={currentDayDate || ''} // 계산된 날짜 바인딩
                  disabled // 수정 불가능하도록 설정
                />
              )}
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
                <li 
                  className="itinerary-item"
                  onClick={() => handlePanToMap(item)}
                >
                  <div className="item-content">
                    <div className="item-number">{index + 1}.</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      
                      <input
                        type="time"
                        className="item-time-input"
                        value={item.time || ''}
                        onChange={(e) => handleTimeChange(item.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // li 클릭 방지
                      />

                    </div>
                  </div>
                  <Icon 
                    className="item-icon delete-icon" // CSS 스타일링을 위해 클래스명 변경
                    onClick={(e) => {
                      e.stopPropagation(); // 부모(li)의 지도 이동(panTo) 이벤트 방지
                      handleDeletePlace(item.id); // 삭제 함수 호출
                    }}
                  >
                    🗑️
                  </Icon>
                </li>
              
                <div className="memo-container">
                  {editingMemoId === item.id ? (
                      // 3. 수정 중일 때: input 표시
                      <input
                        type="text"
                        className="memo-input" // CSS 스타일링용 클래스
                        value={item.memo || ''}
                        onChange={(e) => handleMemoChange(item.id, e.target.value)}
                        onBlur={handleMemoEditEnd} // 포커스 잃으면 완료
                        onKeyDown={(e) => { // Enter 키 누르면 완료
                          if (e.key === 'Enter') handleMemoEditEnd();
                        }}
                        autoFocus // 텍스트 클릭 시 바로 포커스
                        onClick={(e) => e.stopPropagation()} // li의 클릭(지도이동) 방지
                        placeholder="한 줄 메모 입력..."
                      />
                    ) : (
                      // 2. 평상시: 텍스트 표시
                      <span 
                        className="add-memo-text" // CSS 스타일링용 클래스
                        onClick={(e) => {
                          e.stopPropagation(); // li의 클릭(지도이동) 방지
                          handleMemoClick(item.id);
                        }}
                      >
                        {/* 메모가 있으면 메모 내용을, 없으면 기본 텍스트를 표시 */}
                        {item.memo || '📝 메모 추가(장소 이동 시간, 교통수단 기록)'}
                      </span>
                    )}
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
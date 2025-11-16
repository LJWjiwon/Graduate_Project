
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './plan.css';
import Map from './KakaoMap.jsx';
import Header from './header.jsx';
import { useNavigate } from 'react-router-dom';

import { db } from '../firebase.js';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children, onClick }) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
);

// [수정] 샘플 데이터 제거 -> 빈 객체 {} 로 시작
const Plan = () => {
  const navigate = useNavigate();

  // 1. URL의 파라미터(:planId) 값을 가져옵니다.
  const { planId } = useParams();

  // 2. 이 planId를 사용해 Firestore에서
  // /plans/{planId} 문서를 불러오는 로직을 추가하면 됩니다.

  const [planName, setPlanName] = useState('일정 계획'); // (요청 1) 헤더용
  const [planDuration, setPlanDuration] = useState(1); // (요청 3) '다음' 버튼 비활성화용

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

  // [!!신규!!] 1. 드래그 앤 드롭을 위한 state 및 ref
  const [draggedItemId, setDraggedItemId] = useState(null); // 현재 드래그 중인 아이템의 id
  const [dropTargetId, setDropTargetId] = useState(null);   // 현재 드롭 대상인 아이템의 id (시각 효과용)
  // [!!신규!!] 드롭 직후 발생하는 'click' 이벤트를 방지하기 위한 플래그
  const justDropped = useRef(false);

  // [!!신규!!] 4. Firestore 데이터 로딩을 위한 useEffect
  useEffect(() => {
    // planId가 없으면 로직을 실행하지 않음
    if (!planId) return;

    const fetchPlanData = async () => {
      try {
        // 1. Plan 기본 정보 가져오기 (/plans/{planId})
        const planDocRef = doc(db, "plans", planId);
        const planDocSnap = await getDoc(planDocRef);

        if (!planDocSnap.exists()) {
          console.error("해당하는 일정이 없습니다.");
          alert("일정을 찾을 수 없습니다.");
          navigate('/home'); // Home.jsx로 이동
          return;
        }

        const planData = planDocSnap.data();

        // 2. State에 기본 정보 반영
        setPlanName(planData.name); // (요청 1) 헤더 텍스트 변경
        setPlanDuration(planData.duration); // (요청 3) 전체 기간 설정

        // (요청 2) Firestore Timestamp를 'YYYY-MM-DD' 문자열로 변환
        if (planData.startDate) {
          const firestoreDate = planData.startDate.toDate();
          const year = firestoreDate.getFullYear();
          const month = String(firestoreDate.getMonth() + 1).padStart(2, '0');
          const day = String(firestoreDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          setStartDate(dateString); // 시작 날짜 설정
        }

        // 3. 'days' 하위 컬렉션 데이터 가져오기 (Home.jsx가 생성한)
        const daysCollectionRef = collection(db, "plans", planId, "days");
        const daysQuerySnap = await getDocs(daysCollectionRef);

        const initialItinerary = {};
        let hasDays = false;

        daysQuerySnap.forEach(dayDoc => {
          hasDays = true;
          const dayData = dayDoc.data();
          const dayKey = `day${dayData.dayNumber}`;

          // (요청 3)
          // Home.jsx에서 'places' 배열을 만들지 않았으므로,
          // 여기서 빈 배열로 초기화해줍니다.
          initialItinerary[dayKey] = { places: [] };
        });

        // 4. State 업데이트 (duration만큼 생성된 itineraryState)
        if (hasDays) {
          setItineraryState(initialItinerary);
        } else {
          // (Fallback) Home.jsx가 day 문서를 안 만들었을 경우 대비
          // (현재 Home.jsx 코드상으로는 이 로직이 필요 없지만, 
          //  혹시 모를 상황을 대비해 planData.duration 기준으로도 생성)
          const fallbackItinerary = {};
          for (let i = 1; i <= planData.duration; i++) {
            fallbackItinerary[`day${i}`] = { places: [] };
          }
          setItineraryState(fallbackItinerary);
        }

        // (참고)
        // 나중에 '저장' 기능을 만드실 때,
        // 각 'day' 문서의 'places' 하위 컬렉션에서 장소 목록을 
        // 불러와서 'places: [...]' 배열을 채워야 합니다.
        // 지금은 '새로 생성된' 일정을 불러오는 것이므로 'places: []'가 맞습니다.

      } catch (error) {
        console.error("일정 데이터 로드 중 오류 발생:", error);
        alert("일정 로딩에 실패했습니다.");
      }
    };

    fetchPlanData();

  }, [planId, navigate]); // planId가 변경되면(즉, 페이지가 로드되면) 실행

  const handleDayChange = (direction) => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
      // (이전) } else if (direction === 'next') {
    } else if (direction === 'next' && currentDay < planDuration) { // (수정) (요청 3)
      const nextDayKey = `day${currentDay + 1}`;
      if (!itineraryState[nextDayKey]) {
        // (참고: useEffect에서 이미 duration만큼 생성했으므로, 
        // 이 로직은 사실상 필요 없지만 안전장치로 둡니다.)
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
    // [!!수정!!] 드롭 직후(justDropped.current === true)라면 지도 이동(클릭)을 무시
    if (justDropped.current) {
      return;
    }

    // item에 y, x 좌표가 있는지 확인 (handleAddPlaceToItinerary에서 ...place로 복사했기 때문에 있어야 함)
    if (item.y && item.x) {
      setPanTarget(item); // panTarget state를 클릭한 장소 정보로 업데이트
    } else {
      console.error("이동할 좌표 정보가 없습니다:", item);
    }
  };

  // 장소 삭제 핸들러
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

  // [!!신규!!] 2. 드래그 앤 드롭 이벤트 핸들러 

  // 드래그 시작
  const handleDragStart = (e, item) => {
    setDraggedItemId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  // 드래그 아이템이 다른 아이템 위에 올라갔을 때
  const handleDragOver = (e) => {
    e.preventDefault(); // 필수: 'drop' 이벤트를 허용하기 위해
  };

  // 드래그 아이템이 드롭 대상 영역에 들어왔을 때 (시각 효과용)
  const handleDragEnter = (e, targetId) => {
    e.preventDefault();
    if (draggedItemId !== targetId) {
      setDropTargetId(targetId);
    }
  };

  // 드래그 아이템이 드롭 대상 영역에서 나갔을 때 (시각 효과용)
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDropTargetId(null);
  };

  // 드롭 (순서 변경 로직)
  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    justDropped.current = true; // [!!중요!!] 클릭 방지 플래그 ON

    const dayKey = `day${currentDay}`;
    const currentList = itineraryState[dayKey].places;
    const draggedId = draggedItemId; // 드래그 중인 아이템 ID (state에서 가져옴)
    const targetId = targetItem.id;  // 드롭된 위치의 아이템 ID

    // 1. 자기 자신 위에 드롭한 경우
    if (draggedId === targetId) {
      setDraggedItemId(null);
      setDropTargetId(null);
      return;
    }

    // 2. 드래그된 아이템 찾기
    const draggedItem = currentList.find(item => item.id === draggedId);
    if (!draggedItem) return; // 예외 처리

    // 3. 드래그된 아이템을 "제외한" 새 배열 생성
    const remainingItems = currentList.filter(item => item.id !== draggedId);

    // 4. 드롭된 위치(target)의 인덱스를 새 배열에서 찾기
    const newTargetIndex = remainingItems.findIndex(item => item.id === targetId);

    // 5. 드롭된 위치에 드래그된 아이템 삽입
    // (예: [A, C, D]가 remainingItems이고, target이 'C'(index 1)면, [A, 'B', C, D]가 됨)
    remainingItems.splice(newTargetIndex, 0, draggedItem);

    // 6. State 업데이트
    setItineraryState(prevState => ({
      ...prevState,
      [dayKey]: { places: remainingItems }
    }));

    // 7. 드래그 상태 초기화
    setDraggedItemId(null);
    setDropTargetId(null);
  };

  // 드래그가 (성공/취소) 종료됐을 때
  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDropTargetId(null);

    // [!!중요!!] 클릭 방지 플래그를 아주 잠깐 뒤에 해제
    // (drop -> dragend -> click 순서로 이벤트가 발생하기 때문)
    setTimeout(() => {
      justDropped.current = false;
    }, 50); // 50ms 딜레이
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
      <Header
        left={<button className="header-button icon-back" onClick={() => navigate('/home')}>
          {'<'}
        </button>}
        center={<h3>{planName}</h3>}
      >
      </Header>

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
              <button onClick={() => handleDayChange('next')} disabled={currentDay === planDuration}>&gt;</button>
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
                  className={`itinerary-item ${item.id === draggedItemId ? 'dragging' : ''} ${item.id === dropTargetId ? 'drop-target' : ''}`}
                  onClick={() => handlePanToMap(item)}

                  // --- [!!신규!!] 드래그 앤 드롭 속성 추가 ---
                  draggable={true} // (1) 드래그 가능하도록 설정
                  onDragStart={(e) => handleDragStart(e, item)} // (2)
                  onDragOver={handleDragOver}                // (3)
                  onDrop={(e) => handleDrop(e, item)}       // (4)
                  onDragEnd={handleDragEnd}                   // (5)
                  onDragEnter={(e) => handleDragEnter(e, item.id)} // (6)
                  onDragLeave={handleDragLeave}               // (7)
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

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './plan.css';
import Map from './KakaoMap.jsx';
import Header from './header.jsx';
import { useNavigate } from 'react-router-dom';

import { db } from '../firebase.js';
import {
  doc, getDoc, collection, getDocs,
  writeBatch, Timestamp, setDoc 
} from "firebase/firestore";

// 아이콘을 위한 간단한 컴포넌트
const Icon = ({ className, children, onClick }) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
);

const Plan = () => {
  const navigate = useNavigate();

  // URL의 파라미터(:planId) 값을 가져옴
  const { planId } = useParams();
  const [planName, setPlanName] = useState('일정 계획'); // 헤더용
  const [planDuration, setPlanDuration] = useState(1); // '다음' 버튼 비활성화용
  const [currentDay, setCurrentDay] = useState(1);
  // 1일차 날짜를 별도 state로 관리
  const [startDate, setStartDate] = useState(null);
  const [itineraryState, setItineraryState] = useState({
    day1: { places: [] }  // places만 관리
  });
  //맵을 이동시킬 타겟 좌표 state
  const [panTarget, setPanTarget] = useState(null);
  // 현재 수정 중인 메모의 ID를 저장하는 state
  const [editingMemoId, setEditingMemoId] = useState(null);
  // 드래그 앤 드롭을 위한 state 및 ref
  const [draggedItemId, setDraggedItemId] = useState(null); // 현재 드래그 중인 아이템의 id
  const [dropTargetId, setDropTargetId] = useState(null);   // 현재 드롭 대상인 아이템의 id (시각 효과용)
  // 드롭 직후 발생하는 'click' 이벤트를 방지하기 위한 플래그
  const justDropped = useRef(false);

  // Firestore 데이터 로딩을 위한 useEffect
  useEffect(() => {
    // planId가 없으면 로직을 실행하지 않음
    if (!planId) return;

    //일정 가져오기
    const fetchPlanData = async () => {
      try {
        // Plan 기본 정보 가져오기 (/plans/{planId})
        const planDocRef = doc(db, "plans", planId);
        const planDocSnap = await getDoc(planDocRef);

        if (!planDocSnap.exists()) {
          console.error("해당하는 일정이 없습니다.");
          alert("일정을 찾을 수 없습니다.");
          navigate('/home'); // Home.jsx로 이동
          return;
        }

        const planData = planDocSnap.data();

        // State에 기본 정보 반영
        setPlanName(planData.name); // 헤더 텍스트 변경
        setPlanDuration(planData.duration); // 전체 기간 설정

        // Firestore Timestamp를 'YYYY-MM-DD' 문자열로 변환
        if (planData.startDate) {
          const firestoreDate = planData.startDate.toDate();
          const year = firestoreDate.getFullYear();
          const month = String(firestoreDate.getMonth() + 1).padStart(2, '0');
          const day = String(firestoreDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          setStartDate(dateString); // 시작 날짜 설정
        }

        // 'days' 하위 컬렉션 데이터 가져오기 (Home.jsx가 생성)
        const daysCollectionRef = collection(db, "plans", planId, "days");
        const daysQuerySnap = await getDocs(daysCollectionRef);
        const initialItinerary = {};
        let hasDays = false;

        daysQuerySnap.forEach(dayDoc => {
          hasDays = true;
          const dayData = dayDoc.data();
          const dayKey = `day${dayData.dayNumber}`;

          initialItinerary[dayKey] = {
            // Firestore에 저장된 places 배열이 있으면 가져오고, 없으면 빈 배열
            places: dayData.places || [],
            //'저장' 버튼이 사용할 Day 문서의 실제 ID
            docId: dayDoc.id
          };
        });

        // State 업데이트 (duration만큼 생성된 itineraryState)
        if (hasDays) {
          setItineraryState(initialItinerary);
        } else {
          // Home.jsx가 day 문서를 안 만들었을 경우 대비
          const fallbackItinerary = {};
          for (let i = 1; i <= planData.duration; i++) {
            fallbackItinerary[`day${i}`] = { places: [], docId: null };
          }
          setItineraryState(fallbackItinerary);
        }

      } catch (error) {
        console.error("일정 데이터 로드 중 오류 발생:", error);
        alert("일정 로딩에 실패했습니다.");
      }
    };

    fetchPlanData();

  }, [planId, navigate]); // planId가 변경되면(즉, 페이지가 로드되면) 실행

  //일정리스트 일차 변경 
  const handleDayChange = (direction) => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === 'next' && currentDay < planDuration) { 
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

  //일정리스트 장소 추가
  const handleAddPlaceToItinerary = (place) => {
    const newItem = {
      ...place, // place 객체의 모든 속성을 복사 (id, place_name, y, x 등)
      name: place.place_name, // 'name' 속성을 'place_name'으로 통일 
      time: null, // 'time' 속성 추가
      memo: ''
    };
    const dayKey = `day${currentDay}`;

    setItineraryState(prevState => {
      // state 업데이트 로직
      const currentDayData = prevState[dayKey] || { places: [], docId: null };
      const currentDayList = currentDayData.places;

      if (currentDayList.some(item => item.id === newItem.id)) {
        alert("이미 추가된 장소입니다.");
        return prevState;
      }
      const newDayList = [...currentDayList, newItem];

      return {
        ...prevState,
        [dayKey]: { ...currentDayData, places: newDayList }
      };
    });
    alert(`'${newItem.name}' 장소를 ${currentDay}일차에 추가했습니다.`);
  };

  // 메모 텍스트 클릭 시 input으로 변경
  const handleMemoClick = (itemId) => {
    setEditingMemoId(itemId);
  };

  // 메모 수정 완료 (포커스 아웃 또는 Enter)
  const handleMemoEditEnd = () => {
    setEditingMemoId(null);
  };

  // 메모 변경 핸들러 
  const handleMemoChange = (itemId, newMemoValue) => {
    const dayKey = `day${currentDay}`;
    setItineraryState(prevState => {
      const currentDayData = prevState[dayKey] || { places: [], docId: null };
      const updatedDayList = currentDayData.places.map(item =>
        item.id === itemId ? { ...item, memo: newMemoValue } : item
      );
      return {
        ...prevState,
        [dayKey]: { ...currentDayData, places: updatedDayList }
      };
    });
  };

  // 시간 변경 핸들러 
  const handleTimeChange = (itemId, newTimeValue) => {
    const dayKey = `day${currentDay}`;
    setItineraryState(prevState => {
      const currentDayData = prevState[dayKey] || { places: [], docId: null };
      const updatedDayList = currentDayData.places.map(item =>
        item.id === itemId ? { ...item, time: newTimeValue } : item
      );
      return {
        ...prevState,
        [dayKey]: { ...currentDayData, places: updatedDayList }
      };
    });
  };

  // 일정 항목 클릭 시 맵 이동을 위한 핸들러
  const handlePanToMap = (item) => {
    // 드롭 직후(순서 변경)라면 지도 이동(클릭)을 무시
    if (justDropped.current) {
      return;
    }

    // item에 y, x 좌표가 있는지 확인
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
      // 현재 날짜의 데이터를 가져옴
      const currentDayData = prevState[dayKey] || { places: [], docId: null };

      // filter를 사용해 해당 id를 가진 항목을 제외한 새 배열 생성
      const updatedDayList = currentDayData.places.filter(
        item => item.id !== itemIdToDelete
      );

      // state 업데이트
      return {
        ...prevState,
        [dayKey]: { ...currentDayData, places: updatedDayList }
      };
    });
  };

  // 드래그 앤 드롭 이벤트 핸들러 
  // 드래그 시작
  const handleDragStart = (e, item) => {
    setDraggedItemId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  // 드래그 아이템이 다른 아이템 위에 올라갔을 때
  const handleDragOver = (e) => {
    e.preventDefault(); // 'drop' 이벤트를 허용하기 위해
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
    justDropped.current = true; // 클릭 방지 플래그 ON

    const dayKey = `day${currentDay}`;
    const currentList = itineraryState[dayKey].places;
    const draggedId = draggedItemId; // 드래그 중인 아이템 ID (state에서 가져옴)
    const targetId = targetItem.id;  // 드롭된 위치의 아이템 ID

    // 자기 자신 위에 드롭한 경우
    if (draggedId === targetId) {
      setDraggedItemId(null);
      setDropTargetId(null);
      return;
    }

    // 드래그된 아이템 찾기
    const draggedItem = currentList.find(item => item.id === draggedId);
    if (!draggedItem) return; // 예외 처리

    // 드래그된 아이템을 제외한 새 배열 생성
    const remainingItems = currentList.filter(item => item.id !== draggedId);

    // 드롭된 위치(target)의 인덱스를 새 배열에서 찾기
    const newTargetIndex = remainingItems.findIndex(item => item.id === targetId);

    // 드롭된 위치에 드래그된 아이템 삽입
    remainingItems.splice(newTargetIndex, 0, draggedItem);

    // State 업데이트
    setItineraryState(prevState => ({
      ...prevState, [dayKey]: {
        ...prevState[dayKey], places: remainingItems
      }
    }));

    // 드래그 상태 초기화
    setDraggedItemId(null);
    setDropTargetId(null);
  };

  // 드래그가 (성공/취소) 종료됐을 때
  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDropTargetId(null);

    // 클릭 방지 플래그를 아주 잠깐 뒤에 해제
    // (drop -> dragend -> click 순서로 이벤트가 발생하기 때문)
    setTimeout(() => {
      justDropped.current = false;
    }, 50); // 50ms 딜레이
  };

  // 저장 핸들러
  const handleSavePlan = async () => {
    // 유효성 검사
    if (!planId || !startDate) {
      alert("일정 ID 또는 시작 날짜가 없습니다. 저장할 수 없습니다.");
      return;
    }

    if (!window.confirm("현재 일정 내용을 저장하시겠습니까?")) {
      return;
    }

    try {
      // 배치(Batch) 쓰기 시작
      const batch = writeBatch(db);
      // /plans/{planId} 문서 업데이트
      // (수정된 planName, 1일차 startDate 업데이트)
      const planDocRef = doc(db, "plans", planId);
      // 'YYYY-MM-DD' 문자열을 다시 Date 객체 -> Timestamp로 변환
      const parts = startDate.split('-').map(Number);
      const startDateObj = new Date(parts[0], parts[1] - 1, parts[2]);

      batch.update(planDocRef, {
        name: planName,
        startDate: Timestamp.fromDate(startDateObj)
      });

      // /plans/{planId}/days/{dayDocId} 문서 업데이트
      for (const dayKey in itineraryState) {
        const dayData = itineraryState[dayKey];
        const dayDocId = dayData.docId; // useEffect에서 저장한 문서 ID

        // docId가 있는 유효한 'day' 문서만 업데이트
        if (dayDocId) {
          // 저장할 장소 목록
          const placesToSave = dayData.places;
          // 해당 Day 문서 참조
          const dayDocRef = doc(db, "plans", planId, "days", dayDocId);

          // 'places' 필드가 Firestore에 없어도 오류 없이 생성/덮어쓰기
          batch.set(dayDocRef, {
            places: placesToSave
          }, { merge: true });

        }
      } 

      // 모든 배치 작업 커밋(전송)
      await batch.commit();

      alert("일정이 성공적으로 저장되었습니다!");

    } catch (error) {
      console.error("일정 저장 중 오류 발생:", error);
      alert("일정 저장에 실패했습니다. 콘솔을 확인해주세요.");
    }
  };

  // state에서 장소 목록 가져오기
  const dayKey = `day${currentDay}`;
  const currentDayData = itineraryState[dayKey] || { places: [], docId: null };
  const currentItinerary = currentDayData.places;

  // 현재 일차의 날짜 계산하기
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
                // 2일차부터: 계산된 날짜를 고정 표시 (비활성화)
                <input
                  type="date"
                  className="day-date-input" // 1일차와 동일한 클래스
                  value={currentDayDate || ''} // 계산된 날짜 바인딩
                  disabled // 수정 불가능하도록 설정
                />
              )}
              <button onClick={() => handleDayChange('next')} disabled={currentDay === planDuration}>&gt;</button>
            </div>
            <button className="save-button" onClick={handleSavePlan}>저장</button>
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
                  draggable={true} // 드래그 가능하도록 설정
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={handleDragOver}               
                  onDrop={(e) => handleDrop(e, item)}       
                  onDragEnd={handleDragEnd}                  
                  onDragEnter={(e) => handleDragEnter(e, item.id)} 
                  onDragLeave={handleDragLeave}              
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
                    className="item-icon delete-icon" 
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
                    // 수정 중일 때: input 표시
                    <input
                      type="text"
                      className="memo-input" 
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
                      className="add-memo-text" 
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
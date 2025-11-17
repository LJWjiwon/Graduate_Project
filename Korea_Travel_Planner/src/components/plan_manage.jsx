import React, { useState, useEffect } from 'react';
import './plan_manage.css';
import Header from './header.jsx';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '../firebase.js';
import {
  collection, getDocs, query, where,
  doc, writeBatch // <--- [!!신규!!] doc, writeBatch 추가
} from "firebase/firestore";

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

const ScheduleItem = ({ title, dateRange, duration, onClick, onDelete }) => {
  return (
    <div className="schedule-item" onClick={onClick}>
      <div className="schedule-info">
        <h3 className="schedule-title">{title}</h3>
        <p className="schedule-date">{`${dateRange} (${duration})`}</p>
      </div>
      <div className="schedule-actions">

        <button className="icon-button" onClick={(e) => {
          e.stopPropagation();
          // TODO: 수정 로직
        }}>✏️</button>


        {/* [!!수정!!] 4. 삭제 버튼에 prop으로 받은 onDelete 함수 연결 */}
        <button className="icon-button" onClick={(e) => {
          e.stopPropagation(); // (중요) 부모(div)의 클릭(페이지 이동) 방지
          onDelete(); // 부모(Manage)로부터 전달받은 삭제 함수 호출
        }}>🗑️</button>

      </div>
    </div>
  );
};


const Manage = () => {
  const navigate = useNavigate();

  // [!!신규!!] 4. Firestore에서 불러온 일정 목록을 저장할 state
  const [myPlans, setMyPlans] = useState([]);
  // [!!신규!!] 5. 로딩 상태를 관리할 state (선택 사항이지만 권장)
  const [isLoading, setIsLoading] = useState(true);

  // [!!신규!!] 6. 날짜 포맷팅을 위한 헬퍼 함수 (컴포넌트 바깥이나 내부에)
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); // Firestore Timestamp -> JS Date
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  // [!!신규!!] 7. 컴포넌트 마운트 시 Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchMyPlans = async () => {
      const user = auth.currentUser; // 현재 로그인한 사용자

      if (!user) {
        console.log("로그인이 필요합니다.");
        setIsLoading(false);
        return; // 로그인이 안 되어있으면 종료
      }

      try {
        // 1. 'plans' 컬렉션에서 'ownerId'가 현재 사용자 ID와 일치하는 문서만 쿼리
        const plansQuery = query(
          collection(db, "plans"),
          where("ownerId", "==", user.uid)
        );

        // 2. 쿼리 실행
        const querySnapshot = await getDocs(plansQuery);

        // 3. 쿼리 결과를 ScheduleItem이 사용하기 좋은 형태로 변환
        const plansList = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // 4. 날짜 계산 (startDate, duration)
          const startDateStr = formatDate(data.startDate);
          const duration = data.duration || 1;

          let endDateStr = startDateStr;
          if (duration > 1 && data.startDate) {
            const endDate = data.startDate.toDate();
            endDate.setDate(endDate.getDate() + duration - 1);
            endDateStr = formatDate({ toDate: () => endDate }); // 헬퍼 함수 재사용
          }

          return {
            id: doc.id, // [!!중요!!] 문서 ID(planId)를 id로 저장
            title: data.name,
            dateRange: `${startDateStr} ~ ${endDateStr}`,
            duration: `${duration}일`,
          };
        });

        // 5. state에 저장
        setMyPlans(plansList);

      } catch (error) {
        console.error("일정 목록 로드 중 오류 발생:", error);
        alert("일정 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchMyPlans();
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 1회만 실행

  // [!!신규!!] 8. 삭제 핸들러 함수
  const handleDeletePlan = async (planId, planName) => {
    // 1. (요청) 사용자에게 확인 메시지 (일정 이름 포함)
    if (!window.confirm(`'${planName}' 일정을 삭제하시겠습니까?`)) {
      return; // 사용자가 '취소'를 누름
    }

    try {
      // 2. (DB 삭제) Firestore에서 삭제
      // (주의: 하위 컬렉션 'days'도 함께 삭제해야 합니다)
      const batch = writeBatch(db);

      // 2-1. 'days' 하위 컬렉션의 모든 문서 가져오기
      const daysCollectionRef = collection(db, "plans", planId, "days");
      const daysQuerySnap = await getDocs(daysCollectionRef);

      // 2-2. 'days' 문서들을 배치 삭제에 추가
      daysQuerySnap.forEach(dayDoc => {
        batch.delete(dayDoc.ref); // dayDoc.ref는 'doc(db, "plans", planId, "days", dayDoc.id)'와 동일
      });

      // 2-3. 메인 'plan' 문서를 배치 삭제에 추가
      const planDocRef = doc(db, "plans", planId);
      batch.delete(planDocRef);

      // 2-4. 배치 작업 실행 (모든 삭제를 한 번에 전송)
      await batch.commit();

      // 3. (UI 삭제) 'myPlans' state에서 삭제된 planId를 가진 항목 제거
      // filter를 사용해 해당 id를 제외한 새 배열을 만듭니다.
      setMyPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));

      alert("일정이 성공적으로 삭제되었습니다.");

    } catch (error) {
      console.error("일정 삭제 중 오류 발생:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="schedule-container">
      <Header
        left={<button className="header-button icon-back" onClick={() => navigate('/home')}>
          {'<'}
        </button>}
        center={<h3>일정 관리</h3>}
      >
      </Header>

      <main className="schedule-main">
        <div className="schedule-list">

          {/* [!!수정!!] 8. 로딩 및 데이터 상태에 따른 렌더링 */}
          {isLoading ? (
            <p>일정 목록을 불러오는 중입니다...</p>
          ) : myPlans.length === 0 ? (
            <p>생성된 일정이 없습니다. 홈에서 일정을 추가해보세요.</p>
          ) : (
            // [!!수정!!] scheduleData 대신 myPlans를 맵핑
            myPlans.map(item => (
              <ScheduleItem
                key={item.id} // Firestore 문서 ID
                title={item.title}
                dateRange={item.dateRange}
                duration={item.duration}
                // [!!수정!!] 9. 클릭 시 planId를 URL로 전달하며 이동
                onClick={() => navigate(`/plan/${item.id}`)}

                // [!!수정!!] 9. onDelete prop 전달
                // item.id와 item.title을 handleDeletePlan 함수에 넘겨줍니다.
                onDelete={() => handleDeletePlan(item.id, item.title)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Manage;
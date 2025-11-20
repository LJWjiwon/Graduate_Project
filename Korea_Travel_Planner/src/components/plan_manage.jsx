import React, { useState, useEffect } from 'react';
import './plan_manage.css';
import Header from './header.jsx';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '../firebase.js';
import {
  collection, getDocs, query, where,
  doc, writeBatch, Timestamp
} from "firebase/firestore";

import CreatePlanModal from './plan_add_modify.jsx';

const ScheduleItem = ({ title, dateRange, duration, onClick, onDelete, onEdit }) => {
  return (
    <div className="schedule-item" onClick={onClick}>
      <div className="schedule-info">
        <h3 className="schedule-title">{title}</h3>
        <p className="schedule-date">{`${dateRange} (${duration})`}</p>
      </div>
      <div className="schedule-actions">
        {/* [!!수정!!] 5. 수정 버튼에 onEdit 함수 연결 */}
        <button className="icon-button" onClick={(e) => {
          e.stopPropagation(); // (중요) 페이지 이동 방지
          onEdit(); // 부모(Manage)로부터 전달받은 수정 함수 호출
        }}>✏️</button>

        <button className="icon-button" onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}>🗑️</button>
      </div>
    </div>
  );
};


const Manage = () => {
  const navigate = useNavigate();

  // Firestore에서 불러온 일정 목록을 저장할 state
  const [myPlans, setMyPlans] = useState([]);
  // [!!신규!!] 5. 로딩 상태를 관리할 state (선택 사항이지만 권장)
  const [isLoading, setIsLoading] = useState(true);

  // [!!신규!!] 6. 수정 모달 상태 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // { id, rawData: { name, startDate, duration } }

  // 6. 날짜 포맷팅을 위한 헬퍼 함수 (컴포넌트 바깥이나 내부에)
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); // Firestore Timestamp -> JS Date
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  // 7. 컴포넌트 마운트 시 Firestore에서 데이터 가져오기
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

        const plansList = querySnapshot.docs.map(doc => {
          const data = doc.data();

          const startDateStr = formatDate(data.startDate);
          const durationNum = data.duration || 1;

          let endDateStr = startDateStr;
          if (durationNum > 1 && data.startDate) {
            const endDate = data.startDate.toDate();
            endDate.setDate(endDate.getDate() + durationNum - 1);
            endDateStr = formatDate({ toDate: () => endDate });
          }

          return {
            id: doc.id,
            title: data.name,
            dateRange: `${startDateStr} ~ ${endDateStr}`,
            duration: `${durationNum}일`,

            // [!!신규!!] 8. 모달에 전달할 원본 데이터
            rawData: {
              name: data.name,
              startDate: startDateStr.replace(/\./g, '-'),
              duration: durationNum
            }
          };
        });
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

  // [!!신규!!] 9. 수정 모달 열기/닫기 핸들러
  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPlan(null);
  };

  // [!!신규!!] 10. (핵심) 일정 업데이트 핸들러
  const handleUpdatePlan = async (formData) => {
    // formData: { planName, startDate, duration }
    if (!editingPlan) return;

    const { id: planId, rawData: oldData } = editingPlan;
    const { planName: newName, startDate: newStartDateStr, duration: newDuration } = formData;
    const oldDuration = oldData.duration;

    // 'YYYY-MM-DD' 문자열 -> Date 객체 -> Timestamp
    const parts = newStartDateStr.split('-').map(Number);
    const newBaseDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const newStartDateTimestamp = Timestamp.fromDate(newBaseDate);

    try {
      const batch = writeBatch(db);

      // 1. (배치 1) /plans/{planId} 문서의 기본 정보 업데이트
      const planDocRef = doc(db, "plans", planId);
      batch.update(planDocRef, {
        name: newName,
        startDate: newStartDateTimestamp,
        duration: newDuration
      });

      // 2. (배치 2~N) duration(일차) 변경 처리
      // (기존 'days' 문서를 가져와야 비교 가능)
      const daysCollectionRef = collection(db, "plans", planId, "days");
      const daysQuerySnap = await getDocs(daysCollectionRef);
      const existingDays = daysQuerySnap.docs.map(d => d.data().dayNumber);
      
      if (newDuration > oldDuration) {
        // 일차가 늘어난 경우: (oldDuration + 1)일차부터 newDuration 일차까지 생성
        for (let i = oldDuration + 1; i <= newDuration; i++) {
          const dayDate = new Date(newBaseDate.getTime());
          dayDate.setDate(newBaseDate.getDate() + (i - 1));
          
          // 새 Day 문서 참조 (ID 자동 생성)
          const newDayRef = doc(collection(db, "plans", planId, "days"));
          batch.set(newDayRef, {
            dayNumber: i,
            date: Timestamp.fromDate(dayDate),
            title: `${i}일차`
          });
        }
      } else if (newDuration < oldDuration) {
        // 일차가 줄어든 경우: newDuration보다 큰 'days' 문서 삭제
        daysQuerySnap.forEach(dayDoc => {
          if (dayDoc.data().dayNumber > newDuration) {
            batch.delete(dayDoc.ref);
          }
        });
      }

      // (참고: newStartDate가 바뀌면, 기존 'days' 문서들의 'date' 필드도 
      //  전부 업데이트해야 하지만, 지금은 'days' 생성/삭제만 구현합니다.)

      // 3. 배치 커밋
      await batch.commit();

      // 4. (UI 업데이트) 로컬 state(myPlans) 즉시 수정
      setMyPlans(prevPlans => prevPlans.map(p => {
        if (p.id === planId) {
          // 수정한 정보로 새 객체를 만들어 반환
          const durationNum = newDuration;
          const startDateStr = newStartDateStr.replace(/-/g, '.'); // 'YYYY.MM.DD'
          let endDateStr = startDateStr;
          if (durationNum > 1) {
            const endDate = new Date(newBaseDate.getTime());
            endDate.setDate(newBaseDate.getDate() + durationNum - 1);
            endDateStr = formatDate({ toDate: () => endDate });
          }
          return {
            id: planId,
            title: newName,
            dateRange: `${startDateStr} ~ ${endDateStr}`,
            duration: `${durationNum}일`,
            rawData: {
              name: newName,
              startDate: newStartDateStr,
              duration: durationNum
            }
          };
        }
        return p; // 수정하지 않은 항목
      }));

      alert("일정이 수정되었습니다.");
      handleCloseEditModal(); // 모달 닫기

    } catch (error) {
      console.error("일정 수정 중 오류 발생:", error);
      alert("일정 수정에 실패했습니다.");
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
                onEdit={() => handleOpenEditModal(item)}
              />
            ))
          )}
        </div>
      </main>

      {/* [!!신규!!] 12. 수정 모달 렌더링 */}
      {isEditModalOpen && (
        <CreatePlanModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdatePlan}
          // "editingPlan"의 "rawData"를 모달의 초기 데이터로 전달
          initialData={editingPlan?.rawData} 
        />
      )}

    </div>
  );
};

export default Manage;
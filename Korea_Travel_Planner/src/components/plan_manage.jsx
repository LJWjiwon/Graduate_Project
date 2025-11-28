import React, { useState, useEffect, useMemo } from 'react';
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
        {/* 수정 버튼에 onEdit 함수 연결 */}
        <button className="icon-button" onClick={(e) => {
          e.stopPropagation(); // 페이지 이동 방지
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
  // 로딩 상태를 관리할 state 
  const [isLoading, setIsLoading] = useState(true);
  // 현재 활성화된 탭 상태 ('all', 'scheduled', 'in_progress', 'completed')
  const [activeTab, setActiveTab] = useState('all');
  // 수정 모달 상태 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // { id, rawData: { name, startDate, duration } }

  // 날짜 포맷팅을 위한 헬퍼 함수 
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); // Firestore Timestamp -> JS Date
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  // 일정의 시작일과 종료일을 계산하는 헬퍼 함수
  const getPlanDates = (plan) => {
    const { startDate, duration } = plan.rawData; // rawData: {startDate: 'YYYY-MM-DD', duration: number}

    // 계획 시작일 (Date 객체, 자정)
    const parts = startDate.split('-').map(Number);
    const planStartDate = new Date(parts[0], parts[1] - 1, parts[2]); // MM은 0부터 시작

    // 계획 종료일 (Date 객체, 자정)
    const planEndDate = new Date(planStartDate.getTime());
    // duration이 N일이면 N-1일을 더해야 종료일이 됩니다.
    planEndDate.setDate(planStartDate.getDate() + duration - 1);

    return { planStartDate, planEndDate };
  };

  // 일정의 현재 상태를 분류하는 함수
  const getPlanStatus = (plan) => {
    const { planStartDate, planEndDate } = getPlanDates(plan);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜를 자정으로 설정하여 시간 요소 무시

    if (planEndDate.getTime() < today.getTime()) {
      return 'completed'; // 완료: 종료일이 오늘보다 이전
    } else if (planStartDate.getTime() <= today.getTime() && today.getTime() <= planEndDate.getTime()) {
      return 'in_progress'; // 진행중: 오늘이 시작일과 종료일 사이에 포함
    } else { // planStartDate > today
      return 'scheduled'; // 예정: 시작일이 오늘보다 이후
    }
  };

  // 일정 목록 필터링 및 정렬
  const filteredPlans = useMemo(() => {
    let list = myPlans;

    // 활성 탭에 따라 필터링
    if (activeTab !== 'all') {
      list = myPlans.filter(plan => getPlanStatus(plan) === activeTab);
    }

    // 시작일(startDate) 기준 과거순(오름차순) 정렬
    // rawData.startDate는 'YYYY-MM-DD' 문자열
    list.sort((a, b) => {
      // Date.parse를 사용해 문자열 날짜를 밀리초로 변환하여 비교
      const dateA = Date.parse(a.rawData.startDate);
      const dateB = Date.parse(b.rawData.startDate);
      return dateA - dateB; // 과거일수록(작을수록) 앞으로 (오름차순)
    });

    return list;
  }, [myPlans, activeTab]); // myPlans나 activeTab이 변경될 때만 재계산


  // 탭별 개수를 계산하는 함수 
  const getTabCount = (status) => {
    if (status === 'all') return myPlans.length;
    return myPlans.filter(plan => getPlanStatus(plan) === status).length;
  };

  // 컴포넌트 마운트 시 Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchMyPlans = async () => {
      const user = auth.currentUser; // 현재 로그인한 사용자

      if (!user) {
        console.log("로그인이 필요합니다.");
        setIsLoading(false);
        return; // 로그인이 안 되어있으면 종료
      }

      try {
        // 'plans' 컬렉션에서 'ownerId'가 현재 사용자 ID와 일치하는 문서만 쿼리
        const plansQuery = query(
          collection(db, "plans"),
          where("ownerId", "==", user.uid)
        );

        // 쿼리 실행
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

            // 모달에 전달할 원본 데이터
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
  }, []); // 컴포넌트가 처음 마운트될 때 1회만 실행

  // 삭제 핸들러 함수
  const handleDeletePlan = async (planId, planName) => {
    // 사용자에게 확인 메시지
    if (!window.confirm(`'${planName}' 일정을 삭제하시겠습니까?`)) {
      return; // 사용자가 '취소'를 누름
    }

    try {
      // Firestore에서 삭제
      const batch = writeBatch(db);

      // 'days' 하위 컬렉션의 모든 문서 가져오기
      const daysCollectionRef = collection(db, "plans", planId, "days");
      const daysQuerySnap = await getDocs(daysCollectionRef);

      // 'days' 문서들을 배치 삭제에 추가
      daysQuerySnap.forEach(dayDoc => {
        batch.delete(dayDoc.ref); // dayDoc.ref는 'doc(db, "plans", planId, "days", dayDoc.id)'와 동일
      });

      // 메인 'plan' 문서를 배치 삭제에 추가
      const planDocRef = doc(db, "plans", planId);
      batch.delete(planDocRef);

      // 배치 작업 실행 (모든 삭제를 한 번에 전송)
      await batch.commit();

      // 'myPlans' state에서 삭제된 planId를 가진 항목 제거
      // filter를 사용해 해당 id를 제외한 새 배열을 만듦
      setMyPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));

      alert("일정이 성공적으로 삭제되었습니다.");

    } catch (error) {
      console.error("일정 삭제 중 오류 발생:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  // 수정 모달 열기/닫기 핸들러
  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPlan(null);
  };

  // 일정 업데이트 핸들러
  const handleUpdatePlan = async (formData) => {
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

      // /plans/{planId} 문서의 기본 정보 업데이트
      const planDocRef = doc(db, "plans", planId);
      batch.update(planDocRef, {
        name: newName,
        startDate: newStartDateTimestamp,
        duration: newDuration
      });

      // duration(일차) 변경 처리
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
      // 배치 커밋
      await batch.commit();

      // 로컬 state(myPlans) 즉시 수정
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

      {/* 탭 네비게이션: getTabCount 함수를 사용해 개수 표시 */}
      <nav className="plan-filter-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          전체 ({getTabCount('all')})
        </button>
        <button
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => setActiveTab('scheduled')}
        >
          예정 ({getTabCount('scheduled')})
        </button>
        <button
          className={activeTab === 'in_progress' ? 'active' : ''}
          onClick={() => setActiveTab('in_progress')}
        >
          진행중 ({getTabCount('in_progress')})
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          완료 ({getTabCount('completed')})
        </button>
      </nav>

      <main className="schedule-main">
        <div className="schedule-list">
          {isLoading ? (
            <p>일정 목록을 불러오는 중입니다...</p>
          ) : myPlans.length === 0 ? (
            <p>생성된 일정이 없습니다. 홈에서 일정을 추가해보세요.</p>
          ) : filteredPlans.length === 0 ? (
            <p>현재 탭에 해당하는 일정이 없습니다.</p>
          ) : (
            // filteredPlans를 맵핑합니다.
            filteredPlans.map(item => (
              <ScheduleItem
                key={item.id}
                title={item.title}
                dateRange={item.dateRange}
                duration={item.duration}
                onClick={() => navigate(`/plan/${item.id}`)}
                onDelete={() => handleDeletePlan(item.id, item.title)}
                onEdit={() => handleOpenEditModal(item)}
              />
            ))
          )}
        </div>
      </main>

      {isEditModalOpen && (
        <CreatePlanModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdatePlan}
          initialData={editingPlan?.rawData}
        />
      )}
    </div>
  );
};

export default Manage;
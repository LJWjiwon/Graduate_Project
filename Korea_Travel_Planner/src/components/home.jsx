import React, { useState } from 'react';
import './home.css';
import Footer from './footer.jsx';
import Plan_add from './plan_add.jsx';

// 2. Firebase 관련 모듈 import
import { db, auth } from '../firebase.js'; // 방금 만든 설정 파일
import { 
  collection, 
  doc, 
  writeBatch, 
  Timestamp 
} from "firebase/firestore";

// 아이콘을 간단한 컴포넌트로 만듭니다. 실제 프로젝트에서는 SVG 아이콘 라이브러리를 사용하는 것이 좋습니다.
const Icon = ({ name, children }) => <div className={`icon ${name}`}>{children}</div>;

// 여행지 카드 컴포넌트
const TravelCard = ({ rank, title }) => (
  <div className="travel-card">
    <div className="card-rank">{rank}</div>
    <div className="card-image-placeholder"></div>
    <p className="card-title">{title}</p>
  </div>
);

// 메인 페이지 컴포넌트
const Home = () => {
  // 모달을 켜고 끄는 state를 추가합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 예시 데이터
  const topDestinations = [
    { id: 1, title: '부산 씨라이프 아쿠아리움' },
    { id: 2, title: '부산 씨라이프 아쿠아리움' },
    { id: 3, title: '부산 씨라이프 아쿠아리움' },
    { id: 4, title: '부산 씨라이프 아쿠아리움' },
  ];

  const petFriendlyDestinations = [
    { id: 1, title: '부산 씨라이프 아쿠아리움' },
    { id: 2, title: '부산 씨라이프 아쿠아리움' },
    { id: 3, title: '부산 씨라이프 아쿠아리움' },
    { id: 4, title: '부산 씨라이프 아쿠아리움' },
  ];

  const handleCreatePlan = async (data) => {
    // data 에는 { planName, startDate, duration } 객체가 들어옵니다.

    const user = auth.currentUser; // 현재 로그인된 사용자 정보

    // 4. 로그인이 되어있는지 확인 (ownerId를 위해 필수)
    if (!user) {
      alert("일정을 생성하려면 로그인이 필요합니다.");
      return; 
    }

    try {
      // 5. 모달에서 받은 데이터 (문자열)를 Firebase 형식으로 변환
      const { planName, startDate, duration } = data;
      
      // <input type="date"> (YYYY-MM-DD) 문자열을 JS Date 객체로 변환
      const baseDate = new Date(startDate); 
      const planDuration = Number(duration); // 숫자로 변환

      // 6. 배치(batch) 쓰기 시작 (여러 문서를 한 번에 쓰기 위함)
      const batch = writeBatch(db);

      // 7. (배치 1) 새 Plan 문서 생성 (ID는 자동 생성)
      // '/plans' 컬렉션에 대한 참조
      const newPlanRef = doc(collection(db, "plans")); 

      const planData = {
        name: planName,
        startDate: Timestamp.fromDate(baseDate), // Firestore Timestamp 타입으로 변환
        duration: planDuration,
        ownerId: user.uid // 현재 로그인한 사용자 ID
        // members 필드는 요청대로 제외
      };
      batch.set(newPlanRef, planData); // 배치에 추가

      // 8. (배치 2~N) duration(일수)만큼 'days' 하위 컬렉션 문서 생성
      for (let i = 1; i <= planDuration; i++) {
        // 각 '일차'의 실제 날짜 계산 (시작일 + (i-1)일)
        const dayDate = new Date(baseDate.getTime());
        dayDate.setDate(baseDate.getDate() + (i - 1));

        // 'days' 하위 컬렉션에 대한 새 문서 참조 (ID 자동 생성)
        // 예: /plans/새PlanID/days/새DayID
        const newDayRef = doc(collection(db, "plans", newPlanRef.id, "days"));

        const dayData = {
          dayNumber: i,
          date: Timestamp.fromDate(dayDate), // Firestore Timestamp
          title: `${i}일차` // 기본 제목 (나중에 수정 가능)
        };
        batch.set(newDayRef, dayData); // 배치에 추가
      }

      // 9. 모든 배치 작업을 한 번에 커밋(전송)
      await batch.commit();

      alert("새 여행 일정이 생성되었습니다!");
      console.log("새 일정 생성 완료! ID:", newPlanRef.id);

    } catch (error) {
      console.error("일정 생성 중 오류 발생:", error);
      alert("일정 생성에 실패했습니다. 다시 시도해주세요.");
    }
    
    // (성공/실패와 관계없이 모달은 Plan_add.jsx의 onSubmit에서 닫힙니다)
  };

  return (
    <div className="container">
      <header className="header">
        <div className="location-selector">
          <Icon name="location-icon">📍</Icon>
          <span>부산광역시 북구</span>
          <Icon name="dropdown-arrow">▾</Icon>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search anything..." />
          <Icon name="search-icon">🔍</Icon>
        </div>
        <div className="user-profile">
          <Icon name="user-icon">👤</Icon>
        </div>
      </header>


      <section className="hero-image-placeholder"></section>

      <main className="content-area">
        <section className="destination-section">
          <div className="section-header">
            <h2>부산 TOP 50 여행지</h2>
            <Icon name="filter-icon">🎚️</Icon>
          </div>
          <div className="card-list">
            {topDestinations.map(dest => (
              <TravelCard key={dest.id} rank={dest.id} title={dest.title} />
            ))}
          </div>
        </section>

        <section className="destination-section">
          <div className="section-header">
            <h2>반려동물 동반 여행지</h2>
          </div>
          <div className="card-list">
            {petFriendlyDestinations.map(dest => (
              <TravelCard key={dest.id} rank={dest.id} title={dest.title} />
            ))}
          </div>
        </section>
      </main>
      <Footer onOpenModalClick={() => setIsModalOpen(true)} />

      <Plan_add
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePlan}
      />
    </div>
  );
};

export default Home;
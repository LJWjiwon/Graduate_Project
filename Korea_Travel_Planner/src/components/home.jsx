import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Footer from './footer.jsx';
import Header from './header.jsx';
import Plan_add from './plan_add_modify.jsx';
import KoreaMap from './KoreaMap.jsx';

// 2. Firebase 관련 모듈 import
import { db, auth } from '../firebase.js'; // 방금 만든 설정 파일
import {
  collection,
  doc,
  writeBatch,
  Timestamp,
  getDocs
} from "firebase/firestore";

// 아이콘을 간단한 컴포넌트로 만듭니다. 실제 프로젝트에서는 SVG 아이콘 라이브러리를 사용하는 것이 좋습니다.
const Icon = ({ name, children }) => <div className={`icon ${name}`}>{children}</div>;

// 메인 페이지 컴포넌트
const Home = () => {
  // 모달을 켜고 끄는 state를 추가합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Home 컴포넌트 최상단에서 useNavigate를 호출합니다.
  const navigate = useNavigate();

  // [!!신규!!] 가장 가까운 일정을 저장할 state
  const [closestPlan, setClosestPlan] = useState(null);
  // [!!통합!!] 지도 관련 State: 현재 선택된 지역
  const [selectedRegion, setSelectedRegion] = useState(null);

  // [!!신규!!] ⭐️ 가장 가까운 다가오는 일정을 불러오는 useEffect
  useEffect(() => {
    const fetchClosestPlan = async () => {
      try {
        const plansCollectionRef = collection(db, "plans");
        const querySnapshot = await getDocs(plansCollectionRef);

        const today = new Date();
        // 시간을 00:00:00으로 설정하여 일(day) 기준으로 정확하게 비교
        today.setHours(0, 0, 0, 0);
        let minDays = Infinity;
        let closest = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Firestore Timestamp를 JS Date 객체로 변환
          const startDate = data.startDate.toDate();
          startDate.setHours(0, 0, 0, 0); // 비교를 위해 시간 제거

          // 오늘 또는 미래의 일정만 계산 (D-day는 0일로 표시되도록)
          if (startDate >= today) {
            // 시작일과 오늘 날짜의 차이 (밀리초)
            const diffTime = startDate.getTime() - today.getTime();
            // 일(day)로 변환하고 올림 (D-day가 0으로 나오도록)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < minDays) {
              minDays = diffDays;
              closest = {
                id: doc.id,
                name: data.name,
                startDate: data.startDate.toDate(), // Date 객체로 저장
                dDay: diffDays
              };
            }
          }
        });

        setClosestPlan(closest);
      } catch (error) {
        console.error("가장 가까운 일정 로드 중 오류 발생:", error);
      }
    };

    fetchClosestPlan();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 날짜 포맷팅 헬퍼 함수 (예: 2025.11.21)
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // [!!통합!!] 지도 클릭 핸들러 (KoreaMap.jsx에서 호출됨)
  const handleRegionClick = (regionIdString) => {

    // 이젠 e.target.id가 아니라, regionIdString에 이미 ID 값이 들어있습니다.
    const regionId = regionIdString;

    // ⭐️ (핵심) regionId가 유효한지 먼저 확인합니다. 
    // e.target이 <svg> 같은 상위 요소일 경우 regionId가 빈 문자열일 수 있습니다.
    if (regionId && regionId.length > 0) {
      setSelectedRegion(regionId);
      alert(`선택한 지역: ${regionId}`);
    } else {
      // ID가 없는 요소를 클릭한 경우 오류를 내지 않고 무시합니다.
      console.log("ID가 없는 요소를 클릭했습니다. (SVG 여백일 수 있음)");
    }
  };

  const handleCreatePlan = async (data) => {
    // data 에는 { planName, startDate, duration } 객체가 들어옵니다.

    const user = auth.currentUser; // 현재 로그인된 사용자 정보

    // 4. 로그인이 되어있는지 확인 (ownerId를 위해 필수)
    if (!user) {
      alert("일정을 생성하려면 로그인이 필요합니다.");
      return;
    }

    // ⭐️ 새로 생성될 Plan의 문서 참조 (ID를 미리 가져옴)
    const newPlanRef = doc(collection(db, "plans"));

    try {
      // 5. 모달에서 받은 데이터 (문자열)를 Firebase 형식으로 변환
      const { planName, startDate, duration } = data;

      // <input type="date"> (YYYY-MM-DD) 문자열을 JS Date 객체로 변환
      const baseDate = new Date(startDate);
      const planDuration = Number(duration); // 숫자로 변환

      // 6. 배치(batch) 쓰기 시작 (여러 문서를 한 번에 쓰기 위함)
      const batch = writeBatch(db);

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
      // 7. 👈 성공 직후, navigate 함수를 호출하여 페이지 이동!
      // newPlanRef.id 를 URL 파라미터로 넘겨줍니다.
      navigate(`/plan/${newPlanRef.id}`);

    } catch (error) {
      console.error("일정 생성 중 오류 발생:", error);
      alert("일정 생성에 실패했습니다. 다시 시도해주세요.");
    }

    // (성공/실패와 관계없이 모달은 Plan_add.jsx의 onSubmit에서 닫힙니다)
  };

  return (
    <div className="container">
      <Header
        left={<button className="header-button icon-back" onClick={() => navigate('/home')}>
          {'🛫'}
        </button>}
        center={<h3>국내여행 루트 플래너</h3>}
      >
      </Header>

      <div className="hero-section">
        <img src="src\assets\Trip_img.png" alt="여행지 이미지" className="hero-image"></img>
        {/* [!!신규!!] 다가오는 일정 표시 영역 */}
        <div className="upcoming-plan-box">
          {closestPlan ? (
            // 다가오는 일정이 있을 경우
            <>
              {/* D-day 표시: 글자가 크고 강조됨 */}
              <div className="d-day-text">
                {closestPlan.dDay === 0 ? (
                  <strong className="d-day-large d-day-today">D-DAY</strong>
                ) : (
                  <strong className="d-day-large">D-{closestPlan.dDay}</strong>
                )}
              </div>
              {/* 일정 이름 (클릭하면 해당 일정으로 이동) */}
              <p
                className="plan-name-small"
                onClick={() => navigate(`/plan/${closestPlan.id}`)}
              >
                {closestPlan.name}
              </p>
              {/* 날짜 표시 */}
              <p className="plan-date-small">
                {formatDate(closestPlan.startDate)} 시작
              </p>
            </>
          ) : (
            // 다가오는 일정이 없을 경우
            <p className="no-plan-message">다가오는 일정이 없습니다.</p>
          )}
        </div>
      </div>

      <main className="content-area map-display-area">
        <div className="map-container-wrapper">
          <h2>지역별 여행 도장 현황</h2>

          {/* ⭐️ 분리된 KoreaMap 컴포넌트 렌더링 */}
          <KoreaMap
            onRegionClick={handleRegionClick}
            selectedRegion={selectedRegion}
          />
        </div>
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
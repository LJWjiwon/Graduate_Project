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
  getDocs,
  query,
  where
} from "firebase/firestore";

const MIN_STAMP_COUNT = 5; // 도장 획득 최소 횟수 설정

// [!!신규!!] 1. 여행 리포트 데이터를 표시하는 컴포넌트
const TravelReport = ({ reportData }) => {
  const { totalTrips, thisYearTrips, mostVisitedRegion, averageDuration } = reportData;

  // 평균 기간 포맷팅 (예: 2박 3일)
  const avgDurationStr = averageDuration > 0
    ? `${Math.floor(averageDuration)}박 ${Math.floor(averageDuration) + 1}일`
    : '집계 중...';

  return (
    <div className="travel-report-container">
      <h3>📈 나의 여행 기록 리포트</h3>
      <div className="report-cards">
        <div className="report-card">
          <h4>총 여행 횟수</h4>
          <p className="report-value"><strong>{totalTrips}</strong> 회</p>
        </div>
        <div className="report-card">
          <h4>올해 여행 횟수</h4>
          <p className="report-value"><strong>{thisYearTrips}</strong> 회</p>
        </div>
        <div className="report-card">
          <h4>최다 방문 지역</h4>
          <p className="report-value">
            <strong>{mostVisitedRegion || '기록 없음'}</strong>
          </p>
        </div>
        <div className="report-card">
          <h4>평균 여행 기간</h4>
          <p className="report-value"><strong>{avgDurationStr}</strong></p>
        </div>
      </div>
    </div>
  );
};

const StampView = ({ selectedRegion, visitedRegionsData }) => {
  // 1. 현재 선택된 지역의 방문 횟수를 가져옵니다.
  const visitCount = visitedRegionsData[selectedRegion] || 0;
  const isStamped = visitCount >= MIN_STAMP_COUNT;
  const visitsRemaining = MIN_STAMP_COUNT - visitCount;

  if (!selectedRegion) {
    return (
      <div className="stamp-view-box empty">
        <p>🗺️ 지도를 클릭하여 방문 횟수를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="stamp-view-box">
      <h3>🏆 {selectedRegion} 방문 횟수 </h3>
      <p className="visit-count">
        총 방문 횟수: <strong>{visitCount}회</strong>
      </p>

      <div className="stamp-area">
        {isStamped ? (
          <div className="stamp-achieved">
            {/* 5회 이상 방문 도장 이미지 대체 */}
            <div className="stamp-icon">🎉</div>
            <p><strong>도장 획득 완료!</strong></p>
          </div>
        ) : (
          <div className="stamp-pending">
            <p>도장 획득까지 <strong>{visitsRemaining}회</strong> 남았습니다.</p>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${(visitCount / MIN_STAMP_COUNT) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 한국 주소 문자열에서 시/군/구 이름을 추출합니다.
 * 예: "전북특별자치도 김제시 금산면..." -> "김제시"
 * @param {string} address 전체 주소 문자열
 * @returns {string | null} 추출된 시/군/구 이름 또는 찾지 못했을 경우 null
 */



const extractRegionFromAddress = (address) => {
  if (!address) return null;

  // 주소를 공백으로 분리합니다.
  const parts = address.trim().split(/\s+/);

  // 분리된 각 부분을 순회하며 '시', '군', '구'로 끝나는 토큰을 찾습니다.
  // '특별시', '광역시', '특별자치도' 등 상위 단위는 건너뛰기 위해 간단한 규칙을 적용합니다.

  for (const part of parts) {
    if (part.endsWith('시') || part.endsWith('군') || part.endsWith('구')) {
      // '특별시'와 '광역시'는 보통 첫 번째 토큰과 연결되거나, 두 번째 토큰까지 포함되므로,
      // 세 번째 토큰부터 검사하여 가장 구체적인 지역을 찾는 것이 안전하지만,
      // 여기서는 '시', '군', '구'로 끝나는 첫 번째 유효한 단어를 반환합니다.

      // 대부분의 경우 '서울특별시', '부산광역시', '제주특별자치도'와 같은 상위 행정구역을 지나
      // '강남구', '부산진구', '김제시'와 같은 시/군/구가 반환될 것입니다.
      return part;
    }
  }

  return null; // 유효한 지역을 찾지 못한 경우
};

// 메인 페이지 컴포넌트
const Home = () => {
  // 모달을 켜고 끄는 state를 추가합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Home 컴포넌트 최상단에서 useNavigate를 호출합니다.
  const navigate = useNavigate();
  // [!!신규!!] 가장 가까운 일정을 저장할 state
  const [closestPlan, setClosestPlan] = useState(null);
  //도장 방문횟수 저장
  const [visitedRegionsData, setVisitedRegionsData] = useState({}); // 시/군/구별 방문 횟수 집계 데이터 State
  // [!!통합!!] 지도 관련 State: 현재 선택된 지역
  const [selectedRegion, setSelectedRegion] = useState(null);
  // [!!신규!!] Firebase Auth 상태를 저장하는 State 추가
  const [currentUser, setCurrentUser] = useState(null);

  // [!!신규!!] 2. 여행 리포트 데이터를 위한 State
  const [reportData, setReportData] = useState({
    totalTrips: 0,
    thisYearTrips: 0,
    mostVisitedRegion: '',
    averageDuration: 0,
  });

  // [!!수정!!] 0. Firebase Auth 상태 변화 감지 및 사용자 정보 업데이트
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      // 로그인 상태가 변경될 때마다 currentUser state를 업데이트합니다.
      setCurrentUser(user);
      // 사용자 정보가 바뀌면 두 개의 데이터 로딩 useEffect도 다시 실행되어야 합니다.
    });
    return () => unsubscribe();
  }, []);

  // [!!수정!!] ⭐️ 가장 가까운 다가오는 일정을 불러오는 useEffect
  useEffect(() => {
    // [!!핵심!!] 로그인된 사용자 정보가 없으면 실행하지 않습니다.
    if (!currentUser) {
      setClosestPlan(null); // 혹시 남아있을 수 있는 이전 사용자 데이터 초기화
      return;
    }

    const fetchClosestPlan = async () => {
      try {
        // 1. 쿼리 생성: plans 컬렉션 중 ownerId가 현재 유저 ID인 문서만 가져오도록 필터링
        const plansQuery = query(
          collection(db, "plans"),
          where("ownerId", "==", currentUser.uid)
        );

        // 2. 필터링된 쿼리 실행
        const querySnapshot = await getDocs(plansQuery);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let minDays = Infinity;
        let closest = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          const startDate = data.startDate.toDate();
          startDate.setHours(0, 0, 0, 0);

          if (startDate >= today) {
            const diffTime = startDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < minDays) {
              minDays = diffDays;
              closest = {
                id: doc.id,
                name: data.name,
                startDate: data.startDate.toDate(),
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
  }, [currentUser]); // [!!핵심!!] currentUser가 변경될 때마다 재실행

  // [!!수정!!] 완료된 일정만 필터링하고 주소에서 지역을 추출하여 집계 및 리포트 계산
  useEffect(() => {
    if (!currentUser) {
      setVisitedRegionsData({});
      setReportData({ totalTrips: 0, thisYearTrips: 0, mostVisitedRegion: '', averageDuration: 0 });
      return;
    }

    const calculateAllVisits = async () => {
      try {
        const plansQuery = query(
          collection(db, "plans"),
          where("ownerId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(plansQuery);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        const counts = {}; // 지역 방문 횟수 집계

        let completedTrips = 0;
        let completedTripsThisYear = 0;
        let totalDurationDays = 0;

        // 기존 변수 대신 배열로 변경하거나, 아래 로직에서 바로 계산합니다.
        let maxVisits = 0;
        let mostVisitedRegions = []; // [!!핵심 수정!!] 공동 1위 지역을 저장할 배열

        for (const planDoc of querySnapshot.docs) {
          const planData = planDoc.data();

          const startDate = planData.startDate.toDate();
          const duration = planData.duration || 1;

          const endDate = new Date(startDate.getTime());
          endDate.setDate(startDate.getDate() + duration - 1);
          endDate.setHours(0, 0, 0, 0);

          // 종료일이 오늘보다 이전인 '완료된 일정'만 집계
          if (endDate < today) {
            completedTrips++;
            totalDurationDays += duration;

            if (endDate.getFullYear() === currentYear) {
              completedTripsThisYear++;
            }

            // 완료된 일정의 장소 데이터 집계
            const daysCollectionRef = collection(db, "plans", planDoc.id, "days");
            const daysSnapshot = await getDocs(daysCollectionRef);

            for (const dayDoc of daysSnapshot.docs) {
              const dayData = dayDoc.data();
              const places = dayData.places || [];

              places.forEach(place => {
                const region = extractRegionFromAddress(place.address_name);

                if (region) {
                  counts[region] = (counts[region] || 0) + 1;
                }
              });
            }
          }
        }

        // [!!수정된 로직!!] 최다 방문 지역 (공동 1위 포함) 계산
        for (const region in counts) {
          if (counts[region] > maxVisits) {
            // 현재 지역이 이전 최대값보다 크면, 최대값과 배열을 리셋
            maxVisits = counts[region];
            mostVisitedRegions = [region];
          } else if (counts[region] === maxVisits && maxVisits > 0) {
            // 현재 지역이 이전 최대값과 같으면, 배열에 추가 (공동 1위)
            mostVisitedRegions.push(region);
          } else if (maxVisits === 0) {
            // 초기 maxVisits가 0일 때 (첫 지역일 때)
            maxVisits = counts[region];
            mostVisitedRegions = [region];
          }
        }

        // 최종 표시될 문자열 생성: '서울시, 부산시, 대구시'
        const mostVisitedRegionName = mostVisitedRegions.join(', ');

        const averageDuration = completedTrips > 0 ? totalDurationDays / completedTrips : 0;


        // State 업데이트
        setVisitedRegionsData(counts);
        setReportData({
          totalTrips: completedTrips,
          thisYearTrips: completedTripsThisYear,
          mostVisitedRegion: mostVisitedRegionName, // 쉼표로 연결된 문자열 저장
          averageDuration: averageDuration,
        });

      } catch (error) {
        console.error("여행 기록 집계 중 오류 발생:", error);
      }
    };

    calculateAllVisits();
  }, [currentUser]);

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
      // alert(`선택한 지역: ${regionId}`);
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

  useEffect(() => {
    document.body.classList.add('home-page-body');
    return () => {
      document.body.classList.remove('home-page-body');
    };
  }, []);

  return (
    <div className="home-container">
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

      {/* ⭐️ [!!핵심!!] 지도와 도장뷰를 감싸는 2단 레이아웃 */}
      <main className="content-area map-and-stamp-layout">

        {/* 1. 지도 영역 (왼쪽) */}
        <div className="map-container-wrapper">
          <h2>🗺️ 방문 지도</h2>
          <KoreaMap
            onRegionClick={handleRegionClick}
            selectedRegion={selectedRegion}
            // 💡 지도를 색칠하기 위해 집계 데이터를 props로 전달해야 합니다.
            visitedRegionsData={visitedRegionsData}
          />
        </div>

        {/* 2. 오른쪽 열 (도장 통계와 리포트) */}
        <div className="right-panel">
          {/* 2-1. 도장 통계 영역 (가장 위) */}
          <StampView
            selectedRegion={selectedRegion}
            visitedRegionsData={visitedRegionsData}
          />

          {/* [!!수정된 위치!!] 2-2. 여행 리포트 표시 (도장 통계 바로 밑) */}
          <TravelReport reportData={reportData} />
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
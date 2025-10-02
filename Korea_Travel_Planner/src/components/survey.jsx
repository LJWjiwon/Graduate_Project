import React, { useState } from 'react';
import './survey.css';

const Survey = () => {
  // 각 질문에 대한 상태를 관리합니다.
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const ageGroups = ['10대', '20대', '30대', '40대', '50대 이상'];
  const companions = ['혼자', '친구', '연인', '가족', '기타'];

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <p className="intro-text">
          더 나은 추천을 위한 첫걸음입니다. 설문에 응해주시면 맞춤화된 추천을 받아보실 수 있습니다.
        </p>

        <h1 className="form-title">1. 기본정보</h1>

        <form>
          {/* 나이대 질문 */}
          <div className="form-group">
            <label className="form-label">나이대는 어떻게 되시나요?</label>
            <div className="button-group">
              {ageGroups.map((age) => (
                <button
                  key={age}
                  type="button"
                  className={`choice-button ${selectedAge === age ? 'selected' : ''}`}
                  onClick={() => setSelectedAge(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 여행 동반자 질문 */}
          <div className="form-group">
            <label className="form-label">여행을 주로 누구랑 다니시나요?</label>
            <div className="button-group">
              {companions.map((comp) => (
                <button
                  key={comp}
                  type="button"
                  className={`choice-button ${selectedCompanion === comp ? 'selected' : ''}`}
                  onClick={() => setSelectedCompanion(comp)}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* 거주 지역 질문 */}
          <div className="form-group">
            <label className="form-label">사는 지역이 어떻게 되시나요?</label>
            <div className="select-group">
              <select className="region-select" defaultValue="">
                <option value="" disabled>지역 선택(시/도)</option>
                <option value="seoul">서울특별시</option>
                <option value="busan">부산광역시</option>
                <option value="incheon">인천광역시</option>
                {/* 다른 시/도 옵션 추가 */}
              </select>
              <select className="region-select" defaultValue="">
                <option value="" disabled>세부지역 선택(시/군/구)</option>
                <option value="gangnam">강남구</option>
                <option value="mapo">마포구</option>
                <option value="haeundae">해운대구</option>
                {/* 다른 시/군/구 옵션 추가 */}
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="bottom-buttons">
        <button className="action-button skip-button">건너뛰기</button>
        <button className="action-button next-button">다음</button>
      </div>
    </div>
  );
};

export default Survey;
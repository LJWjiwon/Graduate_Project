import React, { useState } from 'react';
import './plan_add.css'; // 모달 전용 CSS를 사용 (아래 3번에서 생성)

/**
 * 새 일정 생성 모달 컴포넌트
 * @param {object} props
 * @param {boolean} props.isOpen - 모달이 열려있는지 여부 (필수)
 * @param {function} props.onClose - 닫기 버튼을 누를 때 호출될 함수 (필수)
 * @param {function} props.onSubmit - 확인 버튼을 누를 때 호출될 함수 (data 객체 전달) (필수)
 */
function CreatePlanModal({ isOpen, onClose, onSubmit }) {
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(1); // 기본값 1일

  // 폼의 상태를 초기화하는 함수를 분리합니다 (선택사항이지만 깔끔합니다)
  const resetForm = () => {
    setPlanName('');
    setStartDate('');
    setDuration(1);
  };

  // 확인 버튼 클릭 시
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!planName || !startDate) {
      alert('일정 이름과 시작일을 모두 입력해주세요.');
      return;
    }
    onSubmit({ planName, startDate, duration });
    resetForm(); // 폼 초기화
    onClose();   // 모달 닫기
  };

  // 1. '취소' 버튼 클릭 시 실행할 함수를 새로 만듭니다.
  const handleCancel = () => {
    resetForm(); // 폼 초기화
    onClose();   // 모달 닫기
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음 (null 반환)
  if (!isOpen) {
    return null;
  }

  // 모달이 열려있으면 렌더링
  return (
    // 모달 뒷배경 (Overlay)
    <div className="modal-overlay">
      {/* 모달 창 (이벤트 버블링 방지) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>새 여행 일정 만들기</h3>

        <form onSubmit={handleSubmit}>
          {/* 일정 이름 */}
          <div className="form-group">
            <label htmlFor="planName">일정 이름</label>
            <input
              id="planName"
              type="text"
              className="form-input"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="예: 3박 4일 도쿄 여행"
              required
            />
          </div>

          {/* 시작일 */}
          <div className="form-group">
            <label htmlFor="startDate">시작일</label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* 일정 기간 */}
          <div className="form-group">
            <label htmlFor="duration">일정 기간 (일)</label>
            <input
              id="duration"
              type="number"
              className="form-input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="button-container">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              취소
            </button>
            <button type="submit" className="submit-button">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlanModal;
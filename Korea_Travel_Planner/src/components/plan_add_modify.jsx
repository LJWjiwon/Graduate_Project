import React, { useState, useEffect } from 'react';
import './plan_add_modify.css';

/**
 * 새 일정 생성 모달 컴포넌트
 * @param {object} props
 * @param {boolean} props.isOpen - 모달이 열려있는지 여부 (필수)
 * @param {function} props.onClose - 닫기 버튼을 누를 때 호출될 함수 (필수)
 * @param {function} props.onSubmit - 확인 버튼을 누를 때 호출될 함수 (data 객체 전달) (필수)
 * @param {object | null} [props.initialData] - (선택) 수정 모드일 때 사용할 초기 데이터 { name, startDate, duration }
 */
function CreatePlanModal({ isOpen, onClose, onSubmit, initialData }) {
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(1);

  // [!!신규!!] 3. 수정 모드/생성 모드 판별
  const isEditMode = !!initialData;

  const resetForm = () => {
    setPlanName('');
    setStartDate('');
    setDuration(1);
  };

  // [!!신규!!] 4. 모달이 열릴 때 initialData로 폼 채우기
  useEffect(() => {
    // 모달이 열릴 때
    if (isOpen) {
      if (isEditMode) {
        // "수정 모드"면 initialData로 state 설정
        setPlanName(initialData.name || '');
        setStartDate(initialData.startDate || '');
        setDuration(initialData.duration || 1);
      } else {
        // "생성 모드"면 폼 초기화
        resetForm();
      }
    }
  }, [isOpen, initialData, isEditMode]); // isOpen, initialData가 바뀔 때마다 실행

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!planName || !startDate) {
      alert('일정 이름과 시작일을 모두 입력해주세요.');
      return;
    }
    // [!!수정!!] 5. duration도 객체에 포함 (이전 코드에서 누락된 것 같아 추가합니다)
    onSubmit({ planName, startDate, duration: Number(duration) });
    // (참고: resetForm()과 onClose()는 Home.jsx의 핸들러에서 이미 호출하고 있으므로
    // 여기서 호출하지 않아도 되지만, 안전을 위해 남겨둡니다.)
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* [!!수정!!] 6. 모드에 따라 제목 변경 */}
        <h3>{isEditMode ? '일정 수정' : '새 여행 일정 만들기'}</h3>

        <form onSubmit={handleSubmit}>
          {/* ... (planName, startDate, duration input 필드는 동일) ... */}
          <div className="form-group">
            <label htmlFor="planName">일정 이름</label>
            <input
              id="planName"
              type="text"
              className="form-input"
              value={planName} // (state 바인딩)
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="예: 3박 4일 도쿄 여행"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">시작일</label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              value={startDate} // (state 바인딩)
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">일정 기간 (일)</label>
            <input
              id="duration"
              type="number"
              className="form-input"
              value={duration} // (state 바인딩)
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className="button-container">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              취소
            </button>

            {/* [!!수정!!] 7. 모드에 따라 버튼 텍스트 변경 */}
            <button type="submit" className="submit-button">
              {isEditMode ? '수정' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlanModal;
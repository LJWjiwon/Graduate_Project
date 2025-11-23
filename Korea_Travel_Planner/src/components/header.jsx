import React, { useState, useEffect } from 'react';
import './header.css';
import { auth } from '../firebase'; // [!!추가!!] Firebase auth 객체 불러오기

const Header = ({ left, center }) => {
  // [!!추가!!] 1. 사용자 정보를 저장할 state 정의
  const [userName, setUserName] = useState(''); 

  useEffect(() => {
    // [!!추가!!] 2. 현재 로그인된 사용자 정보 확인
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // [!!추가!!] 3. 표시할 사용자 이름/UID 설정
        // Firebase Auth의 displayName 필드에 이름이 저장된다고 가정
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          // 이름이 없으면 UID의 앞 6자리를 표시
          setUserName(`UID: ${user.uid.substring(0, 6)}...`);
        }
      } else {
        // 로그아웃 상태일 경우 표시될 텍스트
        setUserName('Guest'); 
      }
    });

    // 컴포넌트 언마운트 시 구독 해제 (클린업 함수)
    return () => unsubscribe();
  }, []); // 컴포넌트 마운트 시 1회 실행

  return (
    <header className="app-header">
      {left}

      {center}

      {/* [!!수정!!] 4. 아이콘-유저 버튼 대신 사용자 이름/UID 표시 */}
      <div className="user-info-container">
        {/* 사용자 이름 표시 */}
        <span className="header-user-name">{userName}</span>
        
        {/* 원래의 아이콘 버튼 (오른쪽 정렬 유지용) */}
        <button className="header-button icon-user">
          <span>👤</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
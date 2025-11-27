import React, { useState, useEffect } from 'react';
import './header.css';
import { auth } from '../firebase'; //Firebase auth 객체 불러오기

const Header = ({ left, center }) => {
  //사용자 정보를 저장할 state 정의
  const [userName, setUserName] = useState(''); 

  useEffect(() => {
    //현재 로그인된 사용자 정보 확인
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        //표시할 사용자 이름/UID 설정
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

    return () => unsubscribe();
  }, []); // 컴포넌트 마운트 시 1회 실행

  return (
    <header className="app-header">
      {left}

      {center}

      <div className="user-info-container">
        <span className="header-user-name">{userName}</span>
        <button className="header-button icon-user">
          <span>👤</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
import React, { useEffect, useRef } from 'react';
// 1. firebase.js에서 compat auth 객체와 firebase 자체를 가져옴
import firebase, { auth } from '../firebase'; 
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import './login.css'; 

const Login = () => {
  const uiContainerRef = useRef(null);
  const uiInstanceRef = useRef(null);

  useEffect(() => {
    if (uiInstanceRef.current) {
      return;
    }
    
    uiInstanceRef.current = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig = {
      signInSuccessUrl: '/',
      
      // 2. 인증 공급자(Provider)를 compat 방식으로 변경
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      signInFlow: 'redirect', //창 전체를 로그인 화면 띄우게
      autoUpgradeAnonymousUsers: true,

      callbacks: {
        signInFailure: function(error) {
      // 'autoUpgradeAnonymousUsers' 사용 시 발생하는
      // 계정 충돌(merge conflict) 에러 처리
          if (error.code === 'firebaseui/anonymous-upgrade-merge-conflict') {
            alert('이 구글 계정은 이미 다른 계정에 연결되어 있습니다. 다른 계정으로 로그인해주세요.');
          } else {
        // 기타 다른 에러들
            console.error('로그인 실패:', error);
          }
      // 에러를 처리했으므로 false를 반환 (리디렉션 방지)
      return false;
      }
  }
    };

    if (uiContainerRef.current) {
      uiInstanceRef.current.start(uiContainerRef.current, uiConfig);
    }

    return () => {
      if (uiInstanceRef.current) {
        uiInstanceRef.current.delete();
        uiInstanceRef.current = null;
      }
    };
  }, []); // 'auth'를 의존성 배열에서 제거 (firebase.auth()는 안정적임)

  return (
    <div className='content'>
      <h2>국내 여행 루트 플래너 (Korea Travel Route Planner)</h2>
      <div className='loginContent'>
        <h3>로그인 / 회원가입</h3>
        <div ref={uiContainerRef} id="firebaseui-auth-container"></div>
      </div>
    </div>
  );
};

export default Login;
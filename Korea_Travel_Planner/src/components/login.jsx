import React, { useEffect, useRef } from 'react';
import firebase, { auth, db } from '../firebase';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import './login.css';

const Login = () => {
  const uiContainerRef = useRef(null);
  const uiInstanceRef = useRef(null);

  useEffect(() => {

    console.log('--- Login.js useEffect가 실행되었습니다. ---');

    if (uiInstanceRef.current) { return; }
    uiInstanceRef.current = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig = {
      // 1. signInSuccessUrl을 제거하여 수동 리디렉션 모드로 둡니다.
      // signInSuccessUrl: '/home', 

      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      signInFlow: 'popup',
      autoUpgradeAnonymousUsers: true,

      callbacks: {
        signInSuccessWithAuthResult: async function (authResult, redirectUrl) {
          console.log('로그인 성공! authResult:', authResult);
          const user = authResult.user;
          const isNewUserAuthFlag = authResult.additionalUserInfo.isNewUser;

          const userDocRef = db.collection('users').doc(user.uid);

          try {
            const docSnap = await userDocRef.get();

            // 'docSnap.exists' 대신, 'docSnap.data()'에 'createdAt' 필드가 있는지
            // (즉, 정상적으로 저장된 데이터가 있는지) 확인합니다.
            // '?'(Optional Chaining)는 docSnap.data()가 null일 때 오류를 방지합니다.
            const docHasData = !!docSnap.data()?.createdAt;

            // 1. Auth가 새 유저라고 하거나 (isNewUserAuthFlag = true)
            // 2. '유령 계정'(DB 문서 없음)이거나 (docHasData = false)
            // 3. '텅 빈 껍데기' 계정이면 (docHasData = false)
            if (isNewUserAuthFlag || !docHasData) {

              console.log('Auth 신규, 또는 DB 데이터가 없어 저장을 시도합니다.');

              const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                provider: authResult.additionalUserInfo.providerId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              };

              // set()은 덮어쓰기이므로, '텅 빈 껍데기'에도 안전합니다.
              await userDocRef.set(userData);
              console.log("Firestore에 새 유저 정보 저장/덮어쓰기 완료");

            } else {
              console.log('Auth/DB 모두에 등록된 정상 유저입니다. 저장을 건너뜁니다.');
            }

            // 수동 리디렉션
            window.location.href = '/home';

          } catch (error) {
            console.error("Firestore DB 작업 실패 (get 또는 set): ", error);
            return false;
          }

          return false; // 항상 false 반환
        },

        signInFailure: function (error) {
          console.error('로그인 실패 (Failure Callback):', error);
          return Promise.resolve(false);
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
  }, []);



  return (
    <div className='loginTitle'>
      <h2>국내 여행 루트 플래너 (Korea Travel Route Planner)</h2>
      <div className='loginContent'>
        <h3>로그인 / 회원가입</h3>
        <div ref={uiContainerRef} id="firebaseui-auth-container"></div>
      </div>
    </div>
  );
};

export default Login;
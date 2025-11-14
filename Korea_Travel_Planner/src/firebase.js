//(연결 설정) 이 파일은 프로젝트 전체에서 단 하나만 존재. db와 auth를 내보냅니다.
//api 폴더에 '기능별' 또는 '데이터 모델별'로 파일을 만듭니다.(게시물 관련 기능, 댓글 관련 기능 등)
//파이어베이스 버전 10

import firebase from 'firebase/compat/app'; // v9+ 모듈러 방식 대신 compat/app 임포트
import 'firebase/compat/auth';         // Auth 호환성 모듈
import 'firebase/compat/firestore';  // Firestore 호환성 모듈

import { firebaseConfig } from './api/firebaseConfig';

// 2. Firebase 앱 초기화 (중복 방지 코드 포함)
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // 이미 초기화된 경우
}

// 3. 'compat' 방식으로 각 서비스를 가져와서 내보냅니다.
// (getFirestore(app) 대신 firebase.firestore())
export const db = firebase.firestore(); 
  
// (getAuth(app) 대신 firebase.auth())
export const auth = firebase.auth(); 

// 4. 'FirebaseLogin.js'에서 (GoogleAuthProvider 등)을 사용하기 위해
// firebase 객체 자체를 default로 내보냅니다.
export default firebase;
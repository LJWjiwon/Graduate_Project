//(연결 설정) 이 파일은 프로젝트 전체에서 단 하나만 존재. db와 auth를 내보냅니다.
//api 폴더에 '기능별' 또는 '데이터 모델별'로 파일을 만듭니다.(게시물 관련 기능, 댓글 관련 기능 등)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore 데이터베이스
import { getAuth } from "firebase/auth";       // Firebase 인증
// import { getStorage } from "firebase/storage"; // Firebase 스토리지 (필요시)

import { firebaseConfig } from './api/firebaseConfig';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const db = getFirestore(app);       // Firestore 인스턴스
export const auth = getAuth(app);          // Auth 인스턴스
// export const storage = getStorage(app); // Storage 인스턴스 (필요시)

export default app; // Firebase 앱 자체를 내보낼 수도 있습니다.
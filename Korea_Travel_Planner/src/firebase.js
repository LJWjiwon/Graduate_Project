//db와 auth를 내보냄

import firebase from 'firebase/compat/app'; 
import 'firebase/compat/auth';         
import 'firebase/compat/firestore';  
import { firebaseConfig } from './api/firebaseConfig';

// Firebase 앱 초기화 
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // 이미 초기화된 경우
}

// 각 서비스를 가져와서 내보냄
export const db = firebase.firestore(); 
export const auth = firebase.auth(); 
// firebase 객체 자체를 default로 내보냄
export default firebase;
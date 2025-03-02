// 🔥 Firebase 초기화 파일: firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase 설정값 (네가 사용한 값 넣어)
const firebaseConfig = {
  apiKey: "AIzaSyAagsN25MUDCh_ii9vPXbkH7cFYOkOHqh4",
  authDomain: "word-app-2525d.firebaseapp.com",
  projectId: "word-app-2525d",
  storageBucket: "word-app-2525d.appspot.com", // ❗ 수정됨
  messagingSenderId: "645879755779",
  appId: "1:645879755779:web:0d44e6c844fa709b990a36",
  measurementId: "G-ZYNQYSLLRF"
};

// ✅ Firebase 앱 초기화 (이미 초기화되었는지 체크)
const app = initializeApp(firebaseConfig);

// ✅ Firebase 인증 및 Firestore 가져오기
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

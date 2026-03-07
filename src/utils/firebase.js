// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ ご自身のFirebaseプロジェクトの config に書き換えてください！
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

// Firebaseの初期化とデータベース（Firestore）の呼び出し
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

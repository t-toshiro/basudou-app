// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgmHASydFAjPoO01MQK67HMp3H8fGoYQU",
  authDomain: "basketball-app-8212e.firebaseapp.com",
  projectId: "basketball-app-8212e",
  storageBucket: "basketball-app-8212e.firebasestorage.app",
  messagingSenderId: "479830707810",
  appId: "1:479830707810:web:4e1539dd92c66e957d4b3b",
  measurementId: "G-GXCT67ZP3K",
};

// Firebaseの初期化とデータベース（Firestore）の呼び出し
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

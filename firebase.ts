import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBfxBtnWw-9IgRHKXJ-ukLycqrrKNLXO4k",
  authDomain: "dating-106e1.firebaseapp.com",
  projectId: "dating-106e1",
  storageBucket: "dating-106e1.appspot.com",
  messagingSenderId: "617804443508",
  appId: "1:617804443508:android:4a98aa4e858b32872b8621",
  databaseURL: "https://dating-106e1-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app); // Firebase Auth 초기화
const database = getDatabase(app); // Realtime Database 초기화

export { app, auth, database };

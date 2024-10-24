import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDFCrdit-fxqLYQ3-DV-T9xiEXKfYzH7k8",
  authDomain: "chatsphere-27bf6.firebaseapp.com",
  databaseURL: "https://chatsphere-27bf6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatsphere-27bf6",
  storageBucket: "chatsphere-27bf6.appspot.com",
  messagingSenderId: "553771712784",
  appId: "1:553771712784:web:cbced6ca70d49e15382595",
  measurementId: "G-70ZVHFTT9V"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getDatabase();

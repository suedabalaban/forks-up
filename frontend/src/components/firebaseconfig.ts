import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAieC1ci2n7kYhY-fAoHtTbyFlTx8iRbfU",
  authDomain: "forks-up.firebaseapp.com",
  projectId: "forks-up",
  storageBucket: "forks-up.appspot.com",
  messagingSenderId: "97125224512",
  appId: "1:97125224512:web:22b6d52e3e3c192d148fa5",
  measurementId: "G-JG36F93JB2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

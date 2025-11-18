import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZbTlAGaA4B3LJzAUTJOLZpfa-hLnZ0o4",
  authDomain: "labpilot-1c4e9.firebaseapp.com",
  projectId: "labpilot-1c4e9",
  storageBucket: "labpilot-1c4e9.firebasestorage.app",
  messagingSenderId: "747117539626",
  appId: "1:747117539626:web:27dee5ded89d0284cb2e53",
  measurementId: "G-1KCDQL7ZR4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

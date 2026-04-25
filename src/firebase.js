import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBag8K1jJ9riNdfVe1ukR7JgsSR9W5Ax1c",
  authDomain: "project-176557f6-88f5-4176-ab8.firebaseapp.com",
  projectId: "project-176557f6-88f5-4176-ab8",
  storageBucket: "project-176557f6-88f5-4176-ab8.firebasestorage.app",
  messagingSenderId: "38518242204",
  appId: "1:38518242204:web:f863e6625f4aa478f8e659",
  measurementId: "G-1YL0DDBW3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

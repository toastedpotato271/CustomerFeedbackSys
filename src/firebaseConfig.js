// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAo2INi_uaBDofD9-KrxrkEGlevMrnCJ40",
  authDomain: "cfs-react-4c4eb.firebaseapp.com",
  projectId: "cfs-react-4c4eb",
  storageBucket: "cfs-react-4c4eb.firebasestorage.app",
  messagingSenderId: "657323064458",
  appId: "1:657323064458:web:464d1eb9c8b76e2b2f0173",
  measurementId: "G-SSGTZE11R3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore instance
export default db;
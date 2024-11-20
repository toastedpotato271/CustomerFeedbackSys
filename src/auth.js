import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration
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
const auth = getAuth(app);

// Function to log in with Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export default auth;

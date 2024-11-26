import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to log in with Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user data to localStorage for session persistence
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

// Function to log out
export const logout = async () => {
  try {
    await auth.signOut();

    // Remove user data from localStorage on logout
    localStorage.removeItem('user');
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

// Check if a user is already logged in based on localStorage
export const checkSession = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user;
  } else {
    console.log("No session found.");
    return null;
  }
};

// Sync user state on page load based on localStorage
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Firebase auth state: User signed in", user);
    // Sync Firebase auth state with localStorage user data
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    console.log("Firebase auth state: No user signed in");
    // Clear localStorage if no user is signed in
    localStorage.removeItem('user');
  }

  // Check if there is a user in localStorage and re-authenticate
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (!user.uid && user.refreshToken) {
      try {
        const credential = signInWithCredential(auth, user.refreshToken);
        console.log("User re-authenticated with refreshToken");
      } catch (error) {
        console.error("Error re-authenticating user with refreshToken:", error);
      }
    }
  }
});

export default auth;

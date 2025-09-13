import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
const firebaseConfig = {
  apiKey: "AIzaSyCEo0qB_MoqjEUuFdhQ7Odeh-Onq1PxDu0",
  authDomain: "twitter-clone-6df33.firebaseapp.com",
  projectId: "twitter-clone-6df33",
  storageBucket: "twitter-clone-6df33.firebasestorage.app",
  messagingSenderId: "391808970962",
  appId: "1:391808970962:web:4834c929db7ee2b6563d0b",
  measurementId: "G-42MGSQV1FJ"
};



// Export auth & firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); 
// Google provider (for Google sign-in)
export const googleProvider = new GoogleAuthProvider();

// Phone number auth helpers
export const setUpRecaptcha = (number) => {
  const recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {}, auth);
  recaptchaVerifier.render();
  return signInWithPhoneNumber(auth, number, recaptchaVerifier);
};

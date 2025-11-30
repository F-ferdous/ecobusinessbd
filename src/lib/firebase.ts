import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyALf27VHt5B3RWPIXkeaZClcpLH5nmxfs0",
  authDomain: "ecobusiness-cc899.firebaseapp.com",
  projectId: "ecobusiness-cc899",
  // The default Storage bucket uses the appspot.com domain. Using the firebasestorage.app value here breaks uploads (CORS/preflight failures).
  //storageBucket: "ecobusiness-cc899.appspot.com",
  storageBucket: "ecobusiness-cc899.firebasestorage.app",
  messagingSenderId: "460434698383",
  appId: "1:460434698383:web:9d0bb2c463cf4f9b3700fa",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (client-side only)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;

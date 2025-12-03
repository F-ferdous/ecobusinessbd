import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
// Preferred: GOOGLE_APPLICATION_CREDENTIALS or workload identity
// Optional: SERVICE_ACCOUNT env JSON string
const apps = getApps();

function initAdmin() {
  if (apps.length > 0) return apps[0];
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (svcJson) {
    const creds = JSON.parse(svcJson);
    return initializeApp({ credential: cert(creds) });
  }
  return initializeApp({ credential: applicationDefault() });
}

const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

/**
 * Firebase initialization module.
 *
 * Lazy singleton: `getApps().length === 0` guard ensures we only init once.
 * Firebase public config keys are NOT secrets — they're embedded in client
 * bundles and visible in network requests. Hardcoded here for simplicity
 * on a HashRouter SPA deployed to GitHub Pages (no env injection).
 *
 * ⚠️  Replace the placeholder values below with your actual Firebase project config
 *     from Firebase Console → Project Settings → General → Your apps → SDK setup.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";

// ---------------------------------------------------------------------------
// Firebase config — REPLACE with your project's values
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAg5ipbutMWL_jXpgKLIofswjdtqu4wHf0",
  authDomain: "mybey-9b9f7.firebaseapp.com",
  projectId: "mybey-9b9f7",
  storageBucket: "mybey-9b9f7.firebasestorage.app",
  messagingSenderId: "721357571975",
  appId: "1:721357571975:web:5f6aa6189705eb21223522"
};

// ---------------------------------------------------------------------------
// Lazy singleton initialization
// ---------------------------------------------------------------------------
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------
export { app, auth, db };

// Auth — signInAnonymously is called from useSync, not here.
// We re-export it so useSync can import from one place.
export { signInAnonymously } from "firebase/auth";

// Firestore operation helpers — thin wrappers used by useSync
export { doc, setDoc, getDoc, onSnapshot };
export type { Unsubscribe, DocumentData };
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyDuS-G6DyP52sR-ufd9YXjIUrfPTHwAO1I",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "realtime-chat-9dbfb.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "realtime-chat-9dbfb",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "realtime-chat-9dbfb.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "946165360234",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:946165360234:web:726a5075afe29a15bf0c13",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-5H80JYQ4K9",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;

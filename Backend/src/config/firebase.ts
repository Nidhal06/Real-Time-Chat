import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp: admin.app.App | null = null;

const getPrivateKey = (): string => {
  const key = process.env.FIREBASE_PRIVATE_KEY;

  if (!key) {
    throw new Error('Missing FIREBASE_PRIVATE_KEY environment variable');
  }

  return key.replace(/\\n/g, '\n');
};

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !clientEmail) {
    throw new Error('Missing Firebase service account configuration');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: getPrivateKey(),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  return firebaseApp;
};

export const getFirestore = (): FirebaseFirestore.Firestore => initializeFirebase().firestore();
export const getFirebaseAuth = (): admin.auth.Auth => initializeFirebase().auth();

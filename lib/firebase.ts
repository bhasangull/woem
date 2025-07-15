import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-UgT4RucVbftS8UisxKZv6RkdGs31IJg",
  authDomain: "woem-7205d.firebaseapp.com",
  projectId: "woem-7205d",
  storageBucket: "woem-7205d.firebasestorage.app",
  messagingSenderId: "592995679251",
  appId: "1:592995679251:web:12b18c6144907303eb53e6",
  measurementId: "G-L772BH7EXJ",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };

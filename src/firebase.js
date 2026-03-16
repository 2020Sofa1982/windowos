import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAa7qnrZU71P38R1qytymQrQ_oN-SPIVCs",
  authDomain: "windowos.firebaseapp.com",
  databaseURL: "https://windowos-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "windowos",
  storageBucket: "windowos.firebasestorage.app",
  messagingSenderId: "794735800710",
  appId: "1:794735800710:web:a17cf5d848e8af165e3c07"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Convert "wb:leads" → "data/leads"
const toPath = (key) => 'data/' + key.replace('wb:', '');

// Save one key to Firebase (fire and forget)
export const fbSave = (key, data) => {
  try {
    set(ref(db, toPath(key)), data).catch(e => console.warn('FB save:', e));
  } catch(e) {
    console.warn('FB save error:', e);
  }
};

// Load all data from Firebase at once
export const fbLoadAll = async () => {
  try {
    const snapshot = await get(ref(db, 'data'));
    if (snapshot.exists()) return snapshot.val();
  } catch(e) {
    console.warn('FB load error:', e);
  }
  return null;
};

// Subscribe to real-time updates (returns unsubscribe fn)
export const fbSubscribe = (callback) => {
  const dbRef = ref(db, 'data');
  const handler = (snapshot) => {
    if (snapshot.exists()) callback(snapshot.val());
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

export { db, ref };

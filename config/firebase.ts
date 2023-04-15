// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA_zbMuVYGkqrzyK09LCXqP9AOw7UDdrTk',
  authDomain: 'learn-nextjs-b0d73.firebaseapp.com',
  projectId: 'learn-nextjs-b0d73',
  storageBucket: 'learn-nextjs-b0d73.appspot.com',
  messagingSenderId: '19611705861',
  appId: '1:19611705861:web:b3177f77ddc031e2fe726c',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { db, auth, provider };

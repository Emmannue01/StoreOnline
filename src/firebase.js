// Al inicio del componente AdminEscolar.js
import { initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAbkubJfXmDY1ES9xa-su70rniJXopx124",
  authDomain: "papeleria-5d63c.firebaseapp.com",
  projectId: "papeleria-5d63c",
  storageBucket: "papeleria-5d63c.firebasestorage.app",
  messagingSenderId: "889211141031",
  appId: "1:889211141031:web:745e7bb2b6a230f6a69482",
  measurementId: "G-XMJT4M5DSJ"
};



// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const functions = getFunctions(app);

export { db, auth, rtdb, functions, httpsCallable };
export default app;
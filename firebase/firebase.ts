// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAjX3R0p-KBqXjipwPLt1eKr-jUW1J10vY",
    authDomain: "dkt-chat.firebaseapp.com",
    projectId: "dkt-chat",
    storageBucket: "dkt-chat.firebasestorage.app",
    messagingSenderId: "977269131084",
    appId: "1:977269131084:web:ad6152b2d4d824dfc131e9"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

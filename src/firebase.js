import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDnohhEJrZvLUGDTxjekwfQBPMq7GQIvhE",
  authDomain: "wmp-time-tracker-18fd3.firebaseapp.com",
  projectId: "wmp-time-tracker-18fd3",
  storageBucket: "wmp-time-tracker-18fd3.appspot.com",
  messagingSenderId: "475368846667",
  appId: "1:475368846667:web:49d29815440b4f56c524ce",
  measurementId: "G-YJ9ZCKHEB8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); 

export { auth, provider, signInWithPopup, signOut, db };
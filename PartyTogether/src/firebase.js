
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";



import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCEuZT3Fcs7HRCkupYr_5ZwCnsPK6xjZ3Q",
  authDomain: "partytogetherapp-f8787.firebaseapp.com",
  databaseURL:"partytogetherapp-f8787-default-rtdb.firebaseio.com/",
  projectId: "partytogetherapp-f8787",
  storageBucket: "partytogetherapp-f8787.appspot.com",
  messagingSenderId: "556951871742",
  appId: "1:556951871742:web:d98ed3c5cb13948dbd85af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);


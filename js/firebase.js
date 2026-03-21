import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTX_Zr6z3FwJdEKxZOqNnhpmuRE-hd_Mk",
    authDomain: "exam-form-verify.firebaseapp.com",
    projectId: "exam-form-verify",
    storageBucket: "exam-form-verify.firebasestorage.app",
    messagingSenderId: "903182007047",
    appId: "1:903182007047:web:c457c94da81660e169a3a2",

    databaseURL: "https://exam-form-verify-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
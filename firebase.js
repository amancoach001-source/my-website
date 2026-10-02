import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHGfStg3qm2KxeElKYN6wDVfLW3Arifzk",
  authDomain: "ai-study-accident.firebaseapp.com",
  projectId: "ai-study-accident",
  storageBucket: "ai-study-accident.firebasestorage.app",
  messagingSenderId: "976297982474",
  appId: "1:976297982474:web:dd8be42f797aea44fe3df3",
  measurementId: "G-DEX59X6LBY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };


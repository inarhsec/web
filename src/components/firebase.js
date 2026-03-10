// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLk7RLgVQJudg10OxVu2llsiie3c49Kgs",
  authDomain: "tracker-os-34e7f.firebaseapp.com",
  projectId: "tracker-os-34e7f",
  storageBucket: "tracker-os-34e7f.firebasestorage.app",
  messagingSenderId: "480080302246",
  appId: "1:480080302246:web:2f22645796dd611e956467",
  measurementId: "G-FFMVFNKWRF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
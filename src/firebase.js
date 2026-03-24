import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCv4MqDGbj38GkmcXVsM0xeHoZJTB5GI4w",
  authDomain: "itinerary-d5936.firebaseapp.com",
  projectId: "itinerary-d5936",
  storageBucket: "itinerary-d5936.firebasestorage.app",
  messagingSenderId: "997594181925",
  appId: "1:997594181925:web:0607e38b5bc87432a8aacc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

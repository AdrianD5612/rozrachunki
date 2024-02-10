import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { EmailAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCtuGZ04hzaYQT0rKEsIOVJTGjM8iPxPxM",
    authDomain: "rozrachunki-8414b.firebaseapp.com",
    projectId: "rozrachunki-8414b",
    storageBucket: "rozrachunki-8414b.appspot.com",
    messagingSenderId: "615880268671",
    appId: "1:615880268671:web:2ce271f9a491db67fb184a",
    measurementId: "G-V3958KLPZC"
  };

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
//const analytics = getAnalytics(app);
const provider = new EmailAuthProvider();
const db = getFirestore(app);
const auth = getAuth(app);

export { provider, auth };
export default db;
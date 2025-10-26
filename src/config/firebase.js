import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBZbpz6I4A7hGAOy5tNEUmze0q7cVhRdME",
    authDomain: "anuncia-fc-9e39c.firebaseapp.com",
    projectId: "anuncia-fc-9e39c",
    storageBucket: "anuncia-fc-9e39c.firebasestorage.app",
    messagingSenderId: "679955036607",
    appId: "1:679955036607:web:ce72bc224b4683109dc90a"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Exporta o firestore e a autenticação
export const db = getFirestore(app);
export const auth = getAuth(app);
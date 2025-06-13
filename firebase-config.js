// Firebase configuration object
// Replace the placeholder values below with your Firebase project details
const firebaseConfig = {
  apiKey: "AIzaSyCBCaoEDDBZIqw5Ns1vdZHhjpaG-5ydWbM",
  authDomain: "to-do-list-eb464.firebaseapp.com",
  projectId: "to-do-list-eb464",
  storageBucket: "to-do-list-eb464.firebasestorage.app",
  messagingSenderId: "1093389675888",
  appId: "1:1093389675888:web:1169559f87bf4acc10f3b5",
  measurementId: "G-HH2DL6KW36"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore services
const auth = firebase.auth();
const db = firebase.firestore();

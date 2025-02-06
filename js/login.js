// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { getAuth, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {getFirestore,query, collection, where, getDocs} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"; 

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw",
    authDomain: "cetapp-5ef90.firebaseapp.com",
    projectId: "cetapp-5ef90",
    storageBucket: "cetapp-5ef90.appspot.com",
    messagingSenderId: "710169034602",
    appId: "1:710169034602:web:47b6b7703fd292e3ebef13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//inputs
const db = getFirestore(app);
// alert("ji");
const submit = document.getElementById('submit');

async function getUserNameByEmail(email) {
  try {
    const q = query(collection(db, "user"), where("email", "==", email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No user found with the provided email.");
      return null;
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("User found: ", userData.name);
      return userData.name;
    }
  } catch (e) {
    console.error("Error getting document:", e.message, e);
  }
}
submit.addEventListener("click", function (event) {
  localStorage.clear();

    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
    const name = await getUserNameByEmail(email);
    localStorage.setItem('user',name);
    navigateToCats();
    alert("success");
    
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  });
});

function navigateToCats() {
  window.location.href = `courses.html`;
}
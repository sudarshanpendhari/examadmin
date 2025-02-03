// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
const db = getFirestore(app);

const submit = document.getElementById('submit');

async function addUser(collegeName, email, name) {
  try {
    // Add a new document with an auto-generated ID
    const docRef = await addDoc(collection(db, "user"), {
      collegeName: collegeName,
      email: email,
      mobile: "xxxxxxxx",
      name: name
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document to Firestore:", e);
  }
}
async function incrementUserCount() {
  const totalUsersDocRef = doc(db, "user", "TOTAL_USERS");

  try {
      // Increment the count field by 1
      await updateDoc(totalUsersDocRef, {
          COUNT: increment(1)
      });
      console.log("User count incremented successfully");
  } catch (e) {
      console.error("Error incrementing user count:", e);
  }
}
submit.addEventListener("click", async function (event) {
  localStorage.clear();
  event.preventDefault();
  const email = document.getElementById('email').value;
  const collegeName = document.getElementById('college').value;
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;

  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      alert("Creating account...");
      // Call addUser only after successful authentication
      addUser(collegeName, email, name);
      incrementUserCount();
      const dialog = document.getElementById('rightClickDialog');
      dialog.showModal();
    })
    .catch((error) => {
      const errorMessage = error.message;
      console.error("Error creating account:", errorMessage);
      alert(errorMessage);
    });


});
document.getElementById('closeDialog').addEventListener('click', () => {
  navigateToLogin(); // Hide dialog box
});
function navigateToLogin() {
  window.location.href = `index.html`;
}

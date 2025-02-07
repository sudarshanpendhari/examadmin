// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";


const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}
// Initialize Firebase
const app = initializeApp(fconf);
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

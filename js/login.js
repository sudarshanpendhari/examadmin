// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}

// Initialize Firebase
const app = initializeApp(fconf);

//inputs
const db = getFirestore(app);
// alert("ji");
const submit = document.getElementById("submit");

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
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      if (user.email == "user@gmail.com") {
        const name = await getUserNameByEmail(email);
        localStorage.setItem("user", name);
        navigateToCats();
        alert("success");
      }
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}

// Initialize Firebase
const app = initializeApp(fconf);
const db = getFirestore(app);
const auth = getAuth(app);

// Replace with actual category ID and test ID
const catId = localStorage.getItem("catId");
const catname = localStorage.getItem("catName");
const testId = localStorage.getItem("testId");

// Load ranks from Firestore, sorted by score in descending order
async function loadRanks() {
  document.getElementById("testname").innerText =
    "Results for " + catname + "-" + testId + " Test";
  document.getElementById("title").innerText =
    "Results for " + catname + "-" + testId + " Test";

  const tableBody = document.getElementById("tableb");
  tableBody.innerHTML = ""; // Clear any existing rows

  try {
    console.log(`QUIZ/${catId}/TESTS_LIST/TESTS_INFO/${testId}_Ranks`);
    const ranksRef = collection(
      db,
      `QUIZ/${catId}/TESTS_LIST/TESTS_INFO/${testId}_Ranks`
    );
    const q = query(ranksRef, orderBy("marks", "desc")); // Sort by score in descending order
    const querySnapshot = await getDocs(q);
    //console.log(querySnapshot);
    let rank = 1; // Initialize rank
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Create a row for each document
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${rank++}</td>
                <td>${data.username}</td>
                <td>${data.correct}</td>
                <td>${data.incorrect}</td>
                <td>${data.unattempted}</td>
                <td>${data.marks}</td>
            `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading ranks:", error);
  }
}

// Initialize the ranks loading on page load
document.addEventListener("DOMContentLoaded", loadRanks);

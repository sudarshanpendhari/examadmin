import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase configuration
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

// Replace with actual category ID and test ID
const catId = localStorage.getItem('catId');
const catname= localStorage.getItem('catName');
const testId = localStorage.getItem('testId'); 

// Load ranks from Firestore, sorted by score in descending order
async function loadRanks() {

    document.getElementById('testname').innerText="Results for "+catname+"-"+testId+" Test";
    document.getElementById('title').innerText="Results for "+catname+"-"+testId+" Test";

    const tableBody = document.getElementById('tableb');
    tableBody.innerHTML = ""; // Clear any existing rows

    try {
        console.log(`QUIZ/${catId}/TESTS_LIST/TESTS_INFO/${testId}_Ranks`);
        const ranksRef = collection(db, `QUIZ/${catId}/TESTS_LIST/TESTS_INFO/${testId}_Ranks`);
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


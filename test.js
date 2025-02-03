// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

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
const auth = getAuth(app);

let questions = [];
let questionsl ; // Initialize questions length
let currentQuestionIndex = 0;
const questionStates = [];

// Load questions from Firestore based on category and test
async function loadQuestionsFromFirestore(categoryId, testId) {
    questions.length = 0; // Clear the questions array
    questionStates.length = 0; // Clear the question states array
    questionsl=0;
    try {
        const q = query(collection(db, "Questions"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.CATEGORY === categoryId && data.TEST === testId) {
                questions.push({
                    question: data.Question,
                    options: [data.A, data.B, data.C, data.D],
                    correctOption: data.Answer - 1 // Assuming Answer is a one-based index in Firestore
                });
                questionStates.push('notViewed');
                questionsl++;
            }
        });
        
        document.getElementById('maxmarks').innerText = parseInt(questionsl) * parseInt(pm);
        document.getElementById('noofq').innerText = questionsl;
        // Display the first question if available and generate navigation buttons
        if (questions.length > 0) {
            // Additional code for rendering questions can be added here
        } else {
            console.error("No questions found for this category and test.");
        }
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

// Get test and category information from local storage
const selectedCatId = localStorage.getItem("catId");
const selectedTestId = localStorage.getItem("testId");
const duration = localStorage.getItem("duration");
const pm = localStorage.getItem("posMarks");
const nm = localStorage.getItem("negMarks");
const cn = localStorage.getItem("catName");
const u = localStorage.getItem("user");

document.addEventListener("DOMContentLoaded", () => {
    loadQuestionsFromFirestore(selectedCatId, selectedTestId);
    document.getElementById('time').innerText = duration;
    document.getElementById('time1').innerText = duration;
    document.getElementById('posmark').innerText = pm;
    document.getElementById('negmark').innerText = nm;
    document.getElementById('t12').innerText = `${cn}: ${selectedTestId}`;
    document.getElementById('un').innerText = u;
    
    console.log(questionStates.length);
});

// Previous Button functionality
document.getElementById("previous").addEventListener("click", () => {
    // Set data to local storage instead of using URL parameters
    localStorage.setItem("catId", selectedCatId);
    localStorage.setItem("testId", selectedTestId);
    localStorage.setItem("duration", duration);
    localStorage.setItem("catName", cn);
    localStorage.setItem("user", u);
    
    // Navigate to testinfo.html
    window.location.href = "testinfo.html";
});

// Ready to Begin Button functionality
document.getElementById("ready").addEventListener("click", () => {
    // Set data to local storage instead of using URL parameters
    localStorage.setItem("catId", selectedCatId);
    localStorage.setItem("testId", selectedTestId);
    localStorage.setItem("duration", duration);
    localStorage.setItem("catName", cn);
    localStorage.setItem("user", u);

    // Navigate to mainexamscreen.html
    window.location.href = "mainexamscreen.html";
});

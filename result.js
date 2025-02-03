// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDocs, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve result data from localStorage
    if(localStorage.length === 1){
        const dialog = document.getElementById('localempty');
    dialog.style.display = 'flex';
    }
    else{
        const dialog = document.getElementById('localempty');
        dialog.style.display = 'none';

    }
    document.getElementById('backSubmit').addEventListener('click', () => {
        window.location.href = "categories.html";
    });
    const correctCount = parseInt(localStorage.getItem('correctCount'));
    const incorrectCount = parseInt(localStorage.getItem('incorrectCount'));
    const unansweredCount = parseInt(localStorage.getItem('unansweredCount'));
    const totalScore = parseFloat(localStorage.getItem('totalScore'));
    const timeTaken = parseInt(localStorage.getItem('timeTaken'));

    // Convert time taken to minutes and seconds format
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Set result data in result.html
    document.getElementById('correct').innerText = correctCount;
    document.getElementById('inc').innerText = incorrectCount;
    document.getElementById('notans').innerText = unansweredCount;
    document.getElementById('posneg').innerText = `${totalScore}`;
    document.getElementById('score').innerText = `${totalScore}`;
    document.getElementById('timereq').innerText = formattedTime;

    // Get URL parameters
    const testName = localStorage.getItem('testId');
    const username = localStorage.getItem('user');
    const catId = localStorage.getItem('catId');
    const testId = localStorage.getItem('testId');

    // Add rank data to Firestore only if user hasn't attempted before
    try {
        const ranksRef = collection(db, `QUIZ/${catId}/TESTS_LIST/TESTS_INFO/${testId}_Ranks`);
        const existingQuery = query(ranksRef, where("username", "==", username));
        const existingDocs = await getDocs(existingQuery);
        
        if (existingDocs.empty) {
            // Add new rank entry if user doesn't exist in collection
            await addDoc(ranksRef, {
                username: username,
                correct: correctCount,
                incorrect: incorrectCount,
                unattempted: unansweredCount,
                marks: totalScore,
            });
            console.log("Rank entry added to Firestore.");
        } else {
            console.log("User has already attempted the test. No new entry added.");
        }
    } catch (error) {
        console.error("Error adding rank data to Firestore:", error);
    }
    document.getElementById('rank').addEventListener('click', () => {
        window.location.href = "ranks.html";
    });
    document.getElementById('checkAns').addEventListener('click', () => {
        window.location.href = "answer.html";
    });


    // Add/update test result in User collection
    try {
        const usersRef = collection(db, "user");
        const userQuery = query(usersRef, where("name", "==", username));
        const userDocs = await getDocs(userQuery);

        if (!userDocs.empty) {
            // Get user document ID
            const userDocId = userDocs.docs[0].id;
            const testResultsRef = collection(db, `user/${userDocId}/TestResults`);

            // Check if a matching document exists in TestResults subcollection
            const testResultsQuery = query(
                testResultsRef,
                where("course", "==", "MHT-CET"),
                where("categoryId", "==", catId),
                where("testId", "==", testId)
            );
            const testResultsDocs = await getDocs(testResultsQuery);

            if (!testResultsDocs.empty) {
                // Update existing document with new maxMarks
                const existingDoc = testResultsDocs.docs[0];
                await updateDoc(existingDoc.ref, { lastMarks: totalScore });
                console.log("Existing test result updated in User's TestResults subcollection.");
            } else {
                // Add a new document to TestResults subcollection if no match found
                await addDoc(testResultsRef, {
                    course: "MHT-CET",
                    categoryId: catId,
                    testId: testId,
                    lastMarks: totalScore
                });
                console.log("Test result added to User's TestResults subcollection.");
            }
        } else {
            console.log("User document not found in User collection.");
        }
    } catch (error) {
        console.error("Error adding/updating test results in User collection:", error);
    }
});

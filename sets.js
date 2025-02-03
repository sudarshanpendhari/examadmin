// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection,getDoc, getDocs, doc, addDoc, updateDoc, deleteDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
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

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Global variables
let selectedCatId = localStorage.getItem("catId") || ""; // Get category ID from local storage
let not = localStorage.getItem("noOfTests") || "";       // Get number of tests
let testList = []; // Array to hold the test data
const user = localStorage.getItem("user") || "";         // Get user from local storage
const categoryName = localStorage.getItem("catName") || ""; // Get category name from local storage

// Load tests on document load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('uname').innerText = user;

    if (selectedCatId) {
        loadTests(selectedCatId, not);
    } else {
        console.error("No category ID found in local storage.");
    }

    // Attach event listener to the "Create Test" button
    const createTestButton = document.getElementById("createTestButton");
    if (createTestButton) {
        createTestButton.addEventListener("click", handleCreateTest);
    }
});

// Function to load tests for a given category ID from Firestore and render them in the HTML
async function loadTests(catId, nooftests) {
    try {
        const testContainer = document.querySelector(".test-row");

        if (!testContainer) {
            console.error("Test container not found.");
            return;
        }

        testContainer.innerHTML = ""; // Clear previous content

        const querySnapshot = await getDocs(collection(db, `QUIZ/${catId}/TESTS_LIST`));

        if (querySnapshot.empty) {
            console.warn("No tests found for this category.");
            testContainer.innerHTML = "<p>No tests available.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const testData = doc.data();
            console.log("Test Data:", testData);

            for (let i = 1; i <= nooftests; i++) {
                const testIdKey = `TEST${i}_ID`;
                const testTimeKey = `TEST${i}_TIME`;

                if (testData[testIdKey] && testData[testTimeKey]) {
                    const testId = testData[testIdKey];
                    const duration = testData[testTimeKey];
                    const posmarks = testData.PosMarks || 2;
                    const negmarks = testData.NegMarks || 0;

                    testList.push({
                        id: testId,
                        duration: duration,
                        questions: testData.QUESTIONS,
                        posmarks: posmarks,
                        negmarks: negmarks,
                    });

                    const testCard = document.createElement("div");
                    testCard.classList.add("col-md-4");
                    testCard.innerHTML = `
                        <div class="card test-card">
                            <div class="card-body">
                                <h5 class="test-name">${testId}</h5>
                                <p class="test-name">Duration: ${duration} mins</p>
                                <button class="btn btn-primary start-test-btn" 
                                    data-test-id="${testId}" data-duration="${duration}" 
                                    data-pm="${posmarks}" data-nm="${negmarks}">
                                    Start Test
                                </button>
                                <button class="btn btn-warning edit-test-btn" data-test-id="${testId}">
                                    Edit
                                </button>
                                <button class="btn btn-danger delete-test-btn" data-test-id="${testId}">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;

                    testContainer.appendChild(testCard);
                }
            }
        });

        attachEventListeners();
    } catch (error) {
        console.error("Error loading tests: ", error);
    }
}

// Function to create a new test
async function handleCreateTest() {
    try {
        // Get the reference to QUIZ/${selectedCatId}
        const quizDocRef = doc(db, `QUIZ/${selectedCatId}`);
        const quizDocSnap = await getDoc(quizDocRef);

        if (!quizDocSnap.exists()) {
            alert("QUIZ document not found!");
            return;
        }

        // Get the current number of tests
        const quizData = quizDocSnap.data();
        const currentNoOfTests = quizData.NO_OF_TESTS ;

        // Get all documents in the TESTS_LIST collection
        const querySnapshot = await getDocs(collection(db, `QUIZ/${selectedCatId}/TESTS_LIST`));
        
        // Find the TEST_INFO document
        let testInfoDocRef = null;
        querySnapshot.forEach((doc) => {
            if (doc.id === "TESTS_INFO") { // Check if the document ID is "TEST_INFO"
                testInfoDocRef = doc.ref; // Get the document reference
            }
        });

        if (!testInfoDocRef) {
            alert("TEST_INFO document not found!");
            return;
        }
        console.log(testInfoDocRef);
        // Prompt for new test details
        const testName = prompt("Enter the new test name:");
        const testDuration = prompt("Enter the duration (in minutes):");
        if (!testName || !testDuration) return;

        // Parse 'not' to an integer
        const parsedNot = parseInt(not, 10)+1;
        if (isNaN(parsedNot)) {
            alert("Invalid test number!");
            return;
        }

        // Prepare the data to add to TEST_INFO
        const newTestData = {
            [`TEST${parsedNot}_ID`]: testName,
            [`TEST${parsedNot}_TIME`]: testDuration,
        };

        // Update the TEST_INFO document
        await updateDoc(testInfoDocRef, newTestData);
        console.log("TEST_INFO document updated with new test data:", newTestData);

        // Increment the NO_OF_TEST field in QUIZ/${selectedCatId}
        await updateDoc(quizDocRef, {
            NO_OF_TESTS: currentNoOfTests + 1,
        });
        console.log("NO_OF_TEST field updated:", currentNoOfTests + 1);

        alert("Test added successfully!");
        loadTests(selectedCatId, parsedNot); // Reload tests to reflect the new addition
    } catch (error) {
        console.error("Error creating test:", error);
        alert("Failed to create test.");
    }
}



// Function to update a test
async function updateTest(testId, updatedData) {
    try {
        const testRef = doc(db, `QUIZ/${selectedCatId}/TESTS_LIST`, testId);
        await updateDoc(testRef, updatedData);
        console.log("Test updated successfully");
    } catch (error) {
        console.error("Error updating test: ", error);
    }
}

// Function to delete a test
async function deleteTest(testId) {
    try {
        const querySnapshot = await getDocs(collection(db, `QUIZ/${selectedCatId}/TESTS_LIST`));
        
        // Find the TEST_INFO document
        let testInfoDocRef = null;
        querySnapshot.forEach((doc) => {
            if (doc.id === "TESTS_INFO") { // Check if the document ID is "TEST_INFO"
                testInfoDocRef = doc.ref; // Get the document reference
            }
        });
       // const testInfoRef = doc(db, `QUIZ/${selectedCatId}/TESTS_LIST`, "TESTS_INFO");
        console.log(testInfoDocRef,testId.slice(-1));
        const updates = {
            [`TEST${testId.slice(-1)}_ID`]: deleteField(),
            [`TEST${testId.slice(-1)}_TIME`]: deleteField(),
        };
        await updateDoc(testInfoDocRef, updates);
        console.log("TESTS_INFO document updated to remove test details:", testId);

        // Decrement the NO_OF_TEST field in QUIZ/${selectedCatId}
        const quizDocRef = doc(db, `QUIZ/${selectedCatId}`);
        const quizDocSnap = await getDoc(quizDocRef);

        if (quizDocSnap.exists()) {
            const quizData = quizDocSnap.data();
            const currentNoOfTests = quizData.NO_OF_TESTS || 0;

            // Decrement the count, ensuring it doesn't go below 0
            const newNoOfTests = Math.max(currentNoOfTests - 1, 0);
            await updateDoc(quizDocRef, { NO_OF_TESTS: newNoOfTests });
            console.log("NO_OF_TEST field updated:", newNoOfTests);
        }

        // Reload the tests to reflect changes
        loadTests(selectedCatId, not);
        alert("Test deleted successfully!");
    } catch (error) {
        console.error("Error deleting test:", error);
        alert("Failed to delete test.");
    }
}



// Function to start the test
function navigateToTest(testId, duration, posmarks, negmarks) {
    localStorage.setItem("testId", testId);
    localStorage.setItem("duration", duration);
    localStorage.setItem("posMarks", posmarks);
    localStorage.setItem("negMarks", negmarks);

    window.location.href = "question.html";
}

// Attach event listeners for edit and delete buttons
function attachEventListeners() {
    // Edit test
    document.querySelectorAll(".edit-test-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const testId = e.target.getAttribute("data-test-id");
            const newTestName = prompt("Enter new test name:");
            const newTestDuration = prompt("Enter new test duration (in minutes):");

            if (newTestName && newTestDuration) {
                await updateTest(testId, { NAME: newTestName, DURATION: newTestDuration });
                loadTests(selectedCatId, not);
            }
        });
    });

    // Delete test
    document.querySelectorAll(".delete-test-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const testId = e.target.getAttribute("data-test-id");
            if (confirm("Are you sure you want to delete this test?")) {
                await deleteTest(testId);
            }
        });
    });

    // Start test
    document.querySelectorAll(".start-test-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const testId = e.target.getAttribute("data-test-id");
            const duration = e.target.getAttribute("data-duration");
            const posmarks = e.target.getAttribute("data-pm");
            const negmarks = e.target.getAttribute("data-nm");

            navigateToTest(testId, duration, posmarks, negmarks);
        });
    });
}

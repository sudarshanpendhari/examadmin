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

// Sample JSON Data for Questions (initially empty)
let questions = [];

// Initialize State
let currentQuestionIndex = 0;
const questionStates = [];

// Timer variables
let timerInterval;
let remainingMinutes =localStorage.getItem('duration'); // Initialize with exam duration in minutes
let remainingSeconds = 0; // Initialize with 0 seconds

// Load questions from Firestore based on category and test
async function loadQuestionsFromFirestore(categoryId, testId) {
    questions.length = 0; // Clear the questions array
    questionStates.length = 0; // Clear the question states array

    try {
        const q = query(
            collection(db, "Questions")
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Create a question object
            if (data.CATEGORY === categoryId && data.TEST === testId) {
                questions.push({
                    question: data.Question,
                    options: [data.A, data.B, data.C, data.D],
                    isMath:data.isMath,
                    correctOption: data.Answer - 1 // Assuming Answer is a one-based index in Firestore
                });
                // Initialize question state as 'notViewed'
                questionStates.push('notViewed');
            }
        });

        // Display the first question if available and generate navigation buttons
        if (questions.length > 0) {
            generateQuestionNavButtons(); // Generate the navigation buttons based on questions array
            loadQuestion(0); // Load the first question
            updateSidebar(); // Update sidebar button states
            startTimer(); // Start the timer when the exam begins
        } else {
            console.error("No questions found for this category and test.");
        }
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

// Function to generate navigation buttons dynamically
function generateQuestionNavButtons() {
    const questionNav = document.querySelector('.question-nav');
    questionNav.innerHTML = ''; // Clear any existing buttons

    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.innerText = index + 1; // Set button text to question number
        button.classList.add('question-button'); // Add a class for easy styling
        button.addEventListener('click', () => loadQuestion(index)); // Load the respective question on click
        questionNav.appendChild(button); // Append button to the nav container
    });
}

// Load question based on index
function loadQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];
    document.getElementById('qnumber').innerText = index + 1;

    if (question.isMath === 0) {
        // Plain text question
        document.getElementById('question').innerText = question.question;
    } else if (question.isMath === 1) {
        // Convert text into mathematical form (using any Math rendering library, e.g., MathJax)
        const questionElement = document.getElementById('question');
        questionElement.innerText = ""; // Clear current text
        MathJax.typesetClear([questionElement]); // Clear previous MathJax rendering
        questionElement.innerHTML = `\\(${question.question}\\)`;
        MathJax.typesetPromise([questionElement]);
    } else if (question.isMath === 2) {
        // Display image question
        document.getElementById('question').innerHTML = `<img src="${question.question}" alt="Math Question" class="img-fluid"/>`;
    }

    question.options.forEach((option, i) => {
        document.getElementById(`option${i + 1}text`).innerText = option;
        document.getElementById(`option${i + 1}`).checked = false;
    });

    if (questionStates[currentQuestionIndex] !== 'solved' && questionStates[currentQuestionIndex] !== 'markedForReview') {
        questionStates[currentQuestionIndex] = 'viewed';
    }

    if (questionStates[index] === 'solved' || questionStates[index] === 'markedForReview') {
        const savedAnswer = localStorage.getItem(`question${index}`);
        if (savedAnswer) document.getElementById(`option${savedAnswer}`).checked = true;
    }

    updateSidebar();
}


let fullscreenExitCount = 0;

function openFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error("Error attempting to enable full-screen mode:", err.message);
        });
    }
}

// Detect full-screen exit
function onFullscreenChange() {
    if (!document.fullscreenElement) {
        fullscreenExitCount++;

        if (fullscreenExitCount >= 2) {
            // Automatically submit exam after two fullscreen exits
            submitTest();
        } else {
            stopExamDueToFullscreenExit();
        }
    }
}


// Show the exam start dialog
function showExamStartDialog() {
    const dialog = document.getElementById('examStartDialog');
    

    dialog.style.display = 'flex';
}

// Start the exam in full-screen mode
function startExam() {
    openFullscreen();
    document.getElementById('examStartDialog').style.display = 'none';
    initializeExam();
}

function initializeExam() {
    console.log("Exam started");
}

// Show warning dialog on first fullscreen exit
function stopExamDueToFullscreenExit() {
    clearInterval(timerInterval);

    const dialog = document.getElementById('fullscreenWarningDialog');
    dialog.style.display = 'flex';
}

// Resume exam when user goes back to fullscreen
function resumeExam() {
    openFullscreen();
    document.getElementById('fullscreenWarningDialog').style.display = 'none';
    timerInterval = setInterval(updateTimer, 1000);
    initializeExam();
}

// Timer functionality
function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}


function updateTimer() {
    if (remainingSeconds === 0 && remainingMinutes === 0) {
        clearInterval(timerInterval); // Stop the timer
        submitTest(); // Submit the exam automatically
        return; // Exit the function
    }

    if (remainingSeconds === 0) {
        // Move to the previous minute
        remainingMinutes--;
        remainingSeconds = 59;
    } else {
        // Decrease the seconds
        remainingSeconds--;
    }

    document.getElementById('timer').innerText = formatTime(remainingMinutes, remainingSeconds);
}

function formatTime(minutes, seconds) {
    return `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(value) {
    return value < 10 ? `0${value}` : value;
}


// Event listeners
document.getElementById('startExamButton').addEventListener('click', startExam);
document.getElementById('resumeExamButton').addEventListener('click', resumeExam);
document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("DOMContentLoaded", () => {
    if(localStorage.length === 1||localStorage.getItem('catId')===null){
        const dialog = document.getElementById('localempty');
        const dialog2 = document.querySelector('exam-dialog-content');
        document.getElementById('foot').classList.remove('footer');
        document.getElementById('submit').style.position='revert';
        document.getElementById('saveandnext').style.position='revert';
        dialog.style.display = 'flex';
        dialog2.style.display='none';
    }else{
        const dialog = document.getElementById('localempty');
        dialog.style.display = 'none';

    }
    document.getElementById('backSubmit').addEventListener('click', () => {
        window.location.href = "categories.html";
    });
    const selectedCatId = localStorage.getItem('catId');
    const selectedTestId = localStorage.getItem('testId');
    const cn = localStorage.getItem('catName');
    const u = localStorage.getItem('user');

    loadQuestionsFromFirestore(selectedCatId, selectedTestId);
    document.getElementById('title').innerText = `${cn}: ${selectedTestId}`;
    document.getElementById('profilenm').innerText = u;

    document.getElementById('saveandnext').addEventListener('click', saveAndNext);
    document.getElementById('mark').addEventListener('click', markForReview);
    document.getElementById('clear').addEventListener('click', clearResponse);
    document.getElementById('submit').addEventListener('click', submitTest);

    showExamStartDialog();
});

// Save the current answer and move to the next question
function saveAndNext() {
    saveResponse();

    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        alert('Going to question 1');
        loadQuestion(0);
    }
}

// Save the current response
function saveResponse() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        const optionIndex = selectedOption.id.replace('option', '');
        localStorage.setItem(`question${currentQuestionIndex}`, optionIndex);
        questionStates[currentQuestionIndex] = 'solved';
    }
}

// Mark the current question for review
function markForReview() {
    questionStates[currentQuestionIndex] = 'markedForReview';
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        const optionIndex = selectedOption.id.replace('option', '');
        localStorage.setItem(`question${currentQuestionIndex}`, optionIndex);
    }

    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        alert('Going to question 1');
        loadQuestion(0);
    }

    updateSidebar(currentQuestionIndex);
}

// Clear the current response
function clearResponse() {
    document.querySelectorAll('input[name="option"]').forEach(input => (input.checked = false));
    questionStates[currentQuestionIndex] = 'viewed';
    localStorage.removeItem(`question${currentQuestionIndex}`);
    updateSidebar();
}

// Update the sidebar to reflect the state of the given question index
function updateSidebar(index = null) {
    const questionButtons = document.querySelectorAll('.question-nav button');
    if (index === null) {
        questionButtons.forEach((button, idx) => {
            updateSidebarButton(button, idx);
        });
    } else {
        updateSidebarButton(questionButtons[index], index);
    }
}

// Function to update the state of a single button in the sidebar
function updateSidebarButton(button, index) {
    button.classList.remove('bg-success', 'bg-danger', 'bg-primary', 'bg-warning', 'bg-info', 'bg-light');
    switch (questionStates[index]) {
        case 'notViewed':
            button.style.backgroundColor = "white";
            break;
        case 'viewed':
            button.style.backgroundColor = "red";
            break;
        case 'solved':
            button.style.backgroundColor = "green";
            break;
        case 'markedForReview':
            button.style.backgroundColor = "purple";
            break;
        default:
            button.style.backgroundColor = "white";
    }
}
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const dialog = document.getElementById('rightClickDialog');
    dialog.showModal(); // Show dialog box
});

// Close dialog on button click
document.getElementById('closeDialog').addEventListener('click', () => {
    document.getElementById('rightClickDialog').close(); // Hide dialog box
});
// Submit the test and show result
function submitTest() {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((question, index) => {
        const savedAnswer = localStorage.getItem(`question${index}`);
        if (savedAnswer !== null) {
            if (Number(savedAnswer)-1 === question.correctOption) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        } else {
            unansweredCount++;
        }
    });

    const totalScore = correctCount * 2 ; // Assuming +4 for correct, -1 for incorrect
    const initialDurationInSeconds = parseInt(localStorage.getItem('duration')) * 60; // Initial duration in seconds
    const timerElement = document.getElementById('timer').innerText.split(":");
    const remainingMinutes = parseInt(timerElement[0]);
    const remainingSeconds = parseInt(timerElement[1]);
    const remainingTimeInSeconds = remainingMinutes * 60 + remainingSeconds;
    const timeTaken = initialDurationInSeconds - remainingTimeInSeconds;
    
    // Save result data to localStorage for result.js to access
    localStorage.setItem('correctCount', correctCount);
    localStorage.setItem('incorrectCount', incorrectCount);
    localStorage.setItem('unansweredCount', unansweredCount);
    localStorage.setItem('totalScore', totalScore);
    localStorage.setItem('timeTaken', timeTaken);

    // Redirect to result.html
    window.location.href = "result.html";
}





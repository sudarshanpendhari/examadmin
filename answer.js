import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

async function loadQuestionsFromFirestore(categoryId, testId) {
    const questions = [];

    try {
        const q = query(collection(db, "Questions"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.CATEGORY === categoryId && data.TEST === testId) {
                questions.push({
                    question: data.Question,
                    options: [data.A, data.B, data.C, data.D],
                    correctOption: data.Answer - 1 // Convert to zero-based index
                });
            }
        });

        renderQuestions(questions);
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

function renderQuestions(questions) {
    const questionContainer = document.querySelector('.question');
    questionContainer.innerHTML = ''; // Clear any existing content

    questions.forEach((question, index) => {
        const selectedOption = localStorage.getItem(`question${index}`);
        
        const correctOptionIndex = question.correctOption;
        let label = '';

        // Determine label based on user selection
        if (selectedOption === null) {
            label = '<span class="label unattempted">Unattempted</span>';
        } else if (Number(selectedOption)-1 === correctOptionIndex) {
            label = '<span class="label correct-label">Correct</span>';
        } else {
            label = '<span class="label incorrect-label">Incorrect</span>';
        }

        const questionHTML = `
            <div class="question-item">
                <p><strong>${index + 1}. ${question.question}</strong> ${label}</p>
                ${question.options.map((option, i) => `
                    <div class="option" id="option-${index}-${i}">
                        <input type="radio" id="option${i + 1}" name="question${index}" value="${i}">
                        <label for="option${i + 1}">${String.fromCharCode(97 + i)}) ${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
        questionContainer.insertAdjacentHTML('beforeend', questionHTML);

        // Style each option based on the answer state
        question.options.forEach((_, i) => {
            const optionElement = document.getElementById(`option-${index}-${i}`);

            if (selectedOption !== null) {
                if (Number(selectedOption)-1 === i) {
                    if (i === correctOptionIndex) {
                        optionElement.classList.add('correct');
                        document.querySelector(`input[name="question${index}"][value="${i}"]`).checked = true;
                        // User's answer is correct
                    } else {
                        document.querySelector(`input[name="question${index}"][value="${i}"]`).checked = true;

                        optionElement.classList.add('incorrect'); // User's answer is incorrect
                    }
                }
                if (i === correctOptionIndex) {

                    optionElement.classList.add('correct'); // Correct option styling
                }
            } else {
                if (i === correctOptionIndex) {
                    optionElement.classList.add('correct'); // Unattempted question with correct answer shown
                }
            }
        });
    });
    const u=localStorage.getItem('user');
    const collection=localStorage.getItem('CollectionName');
    console.log(u);
    //localStorage.clear();
    localStorage.setItem('user',u);
    localStorage.setItem('CollectionName',collection);
}

// Load questions on document load
document.addEventListener("DOMContentLoaded", () => {
    const selectedCatId = localStorage.getItem('catId');
    const selectedTestId = localStorage.getItem('testId');
    const catname = localStorage.getItem('catName');
    document.getElementById('testname').innerText="Answers for "+catname+"-"+selectedTestId+" Test";
    document.getElementById('title').innerText="Results for "+catname+"-"+selectedTestId+" Test";

    loadQuestionsFromFirestore(selectedCatId, selectedTestId);
});

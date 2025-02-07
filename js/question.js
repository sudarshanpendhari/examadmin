import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}
// Initialize Firebase
const app = initializeApp(fconf);
const db = getFirestore(app);
const auth = getAuth(app);

// Get category and test from localStorage
const selectedCatId = localStorage.getItem("catId");
const selectedTestId = localStorage.getItem("testId");

// Load all questions from Firestore for the current category and test
async function loadQuestions() {
  try {
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = ""; // Clear existing questions

    const q = query(
      collection(db, "Questions"),
      where("CATEGORY", "==", selectedCatId),
      where("TEST", "==", selectedTestId)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const questions = data.questions;

      Object.entries(questions).forEach(([key, questionData]) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add(
          "list-group-item",
          "justify-content-between"
        );

        let questionContent = "";

        if (questionData.isMath === 0) {
          questionContent = `<div><strong>${questionData.Question}</strong></div>`;
        } else if (questionData.isMath === 1) {
          questionContent = `<div><strong>${questionData.Question}</strong></div>`;
          questionContent += `<div id="mathjax-container-${docSnapshot.id}-${key}">${questionData.Question}</div>`;
        } else if (questionData.isMath === 2) {
          questionContent = `<div><strong>Question:</strong></div>`;
          questionContent += `<div><img src="${questionData.Question}" alt="Question Image" class="img-fluid" /></div>`;
        }

        questionElement.innerHTML = `
          ${questionContent}
          <div>Option A: ${questionData.A}</div>
          <div>Option B: ${questionData.B}</div>
          <div>Option C: ${questionData.C}</div>
          <div>Option D: ${questionData.D}</div>
          <div>Correct Option: ${
            ["A", "B", "C", "D"][questionData.Answer - 1]
          }</div>
          <div>
            <button class="btn btn-info editBtn" data-id="${
              docSnapshot.id
            }" data-key="${key}">Edit</button>
            <button class="btn btn-danger deleteBtn" data-id="${
              docSnapshot.id
            }" data-key="${key}">Delete</button>
          </div>
        `;

        questionList.appendChild(questionElement);

        if (questionData.isMath === 1) {
          MathJax.Hub.Queue([
            "Typeset",
            MathJax.Hub,
            `mathjax-container-${docSnapshot.id}-${key}`,
          ]);
        }
      });
    });

    attachEventListeners();
  } catch (error) {
    console.error("Error loading questions: ", error);
  }
}
// Attach event listeners for edit and delete buttons
const cranks = document.getElementById("ranks");
cranks.addEventListener("click", () => {
  window.location.href = `ranks.html`;
});

function attachEventListeners() {
  const editBtns = document.querySelectorAll(".editBtn");
  const deleteBtns = document.querySelectorAll(".deleteBtn");

  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const docId = btn.getAttribute("data-id");
      const key = btn.getAttribute("data-key");
      const questionRef = doc(db, "Questions", docId);
      getDoc(questionRef).then((docSnap) => {
        const questions = docSnap.data().questions;
        const questionData = questions[key];
        showEditForm(docId, key, questionData);
      });
    });
  });

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const docId = btn.getAttribute("data-id");
      const key = btn.getAttribute("data-key");
      deleteQuestion(docId, key);
    });
  });
}
function showEditForm(docId, key, questionData) {
  document.getElementById("editQuestionText").value = questionData.Question;
  document.getElementById("editOptionA").value = questionData.A;
  document.getElementById("editOptionB").value = questionData.B;
  document.getElementById("editOptionC").value = questionData.C;
  document.getElementById("editOptionD").value = questionData.D;
  document.getElementById("editCorrectOption").value = questionData.Answer - 1;

  // Open edit modal
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();

  // Save edited question
  document.getElementById("saveChangesBtn").addEventListener("click", () => {
    const updatedQuestion = {
      Question: document.getElementById("editQuestionText").value,
      A: document.getElementById("editOptionA").value,
      B: document.getElementById("editOptionB").value,
      C: document.getElementById("editOptionC").value,
      D: document.getElementById("editOptionD").value,
      Answer: parseInt(document.getElementById("editCorrectOption").value) + 1,
    };
    editQuestion(docId, key, updatedQuestion);
    editModal.hide();
    loadQuestions();
  });
}

async function editQuestion(docId, key, newQuestionData) {
  try {
    const questionsRef = doc(db, "Questions", docId);
    const docSnap = await getDoc(questionsRef);
    const questions = docSnap.data().questions;

    // Make sure we don't delete isMath, set it if it's not present
    if (!newQuestionData.hasOwnProperty("isMath")) {
      newQuestionData.isMath = questions[key].isMath; // Keep previous isMath if not provided
    }

    // Update the question with new data
    questions[key] = newQuestionData;

    // Update Firestore with the new question data
    await updateDoc(questionsRef, { questions });

    alert("Question updated successfully.");

    // Reload the questions after update
    loadQuestions(); // This should reload and display the updated question
  } catch (error) {
    console.error("Error editing question: ", error);
    alert("Failed to update question.");
  }
}

// Function to upload image to ImgBB
async function uploadImageToImgBB(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=03ecc2ee7b7df0d3fd54b6fa2f6dbadf",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      return data.data.url; // Return the image URL from ImgBB
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Image upload failed. Please try again.");
    return null;
  }
}

// Handle the "Save Question" button click
// Handle the "Question Type" dropdown change
document.getElementById("questionType").addEventListener("change", (event) => {
  const questionType = parseInt(event.target.value); // Get the selected type
  const imageUploadField = document.getElementById("imageUploadField");
  const a = document.getElementById("A");
  const b = document.getElementById("B");
  const c = document.getElementById("C");
  const d = document.getElementById("D");
  const q = document.getElementById("q");
  // Show or hide the Image Upload field based on selected type
  if (questionType === 2) {
    // If "Image" is selected
    imageUploadField.style.display = "block";
    a.style.display = "none";
    b.style.display = "none";
    c.style.display = "none";
    d.style.display = "none";
    q.style.display = "none"; // Show Image Upload field
  } else {
    imageUploadField.style.display = "none"; // Hide Image Upload field
  }
});

// Handle the "Save Question" button click
document
  .getElementById("saveNewQuestionBtn")
  .addEventListener("click", async () => {
    const questionType = parseInt(
      document.getElementById("questionType").value
    );
    const newQuestionText = document.getElementById("newQuestionText").value;
    const newOptionA = document.getElementById("newOptionA").value;
    const newOptionB = document.getElementById("newOptionB").value;
    const newOptionC = document.getElementById("newOptionC").value;
    const newOptionD = document.getElementById("newOptionD").value;
    const newCorrectOption = parseInt(
      document.getElementById("newCorrectOption").value
    );
    const imageFile = document.getElementById("imageUpload").files[0]; // Get the image file if present

    // Validate form inputs
    if (
      questionType == 1 &&
      (!newQuestionText ||
        !newOptionA ||
        !newOptionB ||
        !newOptionC ||
        !newOptionD ||
        isNaN(newCorrectOption))
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      let imageUrl = null;

      // If the "Image" type is selected, upload the image
      if (questionType === 2 && imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile); // Upload the image and get the URL
      }

      // Prepare the data to be added to Firestore
      const newQuestionData = {
        Question: questionType === 2 ? imageUrl : newQuestionText, // Store image URL if Image is selected
        A: "A",
        B: "B",
        C: "C",
        D: "D",
        Answer: newCorrectOption + 1, // Firestore stores the option as 1-4, not 0-3
        CATEGORY: selectedCatId, // Use your selected category
        TEST: selectedTestId, // Use your selected test
        isMath: questionType, // Store 2 for image, 1 for MathJax, 0 for text
      };

      // Add the question to Firestore under the selected category and test
      const q = query(
        collection(db, "Questions"),
        where("CATEGORY", "==", selectedCatId),
        where("TEST", "==", selectedTestId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnapshot) => {
        const questionsRef = doc(db, "Questions", docSnapshot.id);
        updateDoc(questionsRef, {
          questions: {
            ...docSnapshot.data().questions,
            [Date.now()]: {
              Question: newQuestionText,
              ...newQuestionData,
            },
          },
        });
      });

      alert("Question added successfully.");
      loadQuestions(); // Reload questions after adding the new one
      const addModal = bootstrap.Modal.getInstance(
        document.getElementById("addModal")
      );
      addModal.hide(); // Close the modal after saving
    } catch (error) {
      console.error("Error adding question: ", error);
    }
  });

// Delete a question
async function deleteQuestion(docId, key) {
  try {
    const questionsRef = doc(db, "Questions", docId);
    const docSnap = await getDoc(questionsRef);
    const questions = docSnap.data().questions;
    delete questions[key];
    await updateDoc(questionsRef, { questions });
    loadQuestions();
  } catch (error) {
    console.error("Error deleting question: ", error);
  }
}

// Load questions when the page is ready
loadQuestions();
document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
});

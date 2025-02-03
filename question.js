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
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw",
  authDomain: "cetapp-5ef90.firebaseapp.com",
  projectId: "cetapp-5ef90",
  storageBucket: "cetapp-5ef90.appspot.com",
  messagingSenderId: "710169034602",
  appId: "1:710169034602:web:47b6b7703fd292e3ebef13",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get category and test from localStorage
const selectedCatId = localStorage.getItem("catId");
const selectedTestId = localStorage.getItem("testId");

// Load all questions from Firestore for the current category and test
async function loadQuestions() {
  try {
    const questionList = document.getElementById("questionList");
    const q = query(
      collection(db, "Questions"),
      where("CATEGORY", "==", selectedCatId),
      where("TEST", "==", selectedTestId)
    );
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      console.log(data);

      if (data.CATEGORY === selectedCatId && data.TEST === selectedTestId) {
        const questionElement = document.createElement("div");
        questionElement.classList.add(
          "list-group-item",
          "justify-content-between"
        );

        let questionContent = "";

        // Check the value of ismath and adjust accordingly
        if (data.isMath === 0) {
          // No changes, display question as-is
          questionContent = `<div><strong>${data.Question}</strong></div>`;
        } else if (data.isMath === 1) {
          // Use MathJax to render the question (assuming LaTeX is used in the question)
          questionContent = `<div><strong>${data.Question}</strong></div>`;
          questionContent += `<div id="mathjax-container-${docSnapshot.id}">${data.Question}</div>`;
        } else if (data.isMath === 2) {
          // Load image from URL provided in the question field
          questionContent = `<div><strong>Question:</strong></div>`;
          questionContent += `<div><img src="${data.Question}" alt="Question Image" class="img-fluid" /></div>`;
        }

        // Build the rest of the options and buttons
        questionElement.innerHTML = `
                    ${questionContent}
                    <div>Option A: ${data.A}</div>
                    <div>Option B: ${data.B}</div>
                    <div>Option C: ${data.C}</div>
                    <div>Option D: ${data.D}</div>
                    <div>Correct Option: ${
                      ["A", "B", "C", "D"][data.Answer - 1]
                    }</div>
                    <div>
                        <button class="btn btn-info editBtn" data-id="${
                          docSnapshot.id
                        }">Edit</button>
                        <button class="btn btn-danger deleteBtn" data-id="${
                          docSnapshot.id
                        }">Delete</button>
                    </div>
                `;
        questionList.appendChild(questionElement);

        // If ismath is 1 (LaTeX), render MathJax
        if (data.isMath === 1) {
          MathJax.Hub.Queue([
            "Typeset",
            MathJax.Hub,
            `mathjax-container-${docSnapshot.id}`,
          ]);
        }
      }
    });

    // Add event listeners to Edit and Delete buttons
    const editBtns = document.querySelectorAll(".editBtn");
    editBtns.forEach((btn) => {
      btn.addEventListener("click", (event) =>
        editQuestion(event.target.dataset.id)
      );
    });

    const deleteBtns = document.querySelectorAll(".deleteBtn");
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", (event) =>
        deleteQuestion(event.target.dataset.id)
      );
    });
  } catch (error) {
    console.error("Error loading questions: ", error);
  }
}

// Open the modal to edit a question
async function editQuestion(questionId) {
  try {
    const questionRef = doc(db, "Questions", questionId);
    const questionDoc = await getDoc(questionRef);
    const questionData = questionDoc.data();

    // Set the modal fields with current question data
    document.getElementById("editQuestionText").value = questionData.Question;
    document.getElementById("editOptionA").value = questionData.A;
    document.getElementById("editOptionB").value = questionData.B;
    document.getElementById("editOptionC").value = questionData.C;
    document.getElementById("editOptionD").value = questionData.D;
    document.getElementById("editCorrectOption").value =
      questionData.Answer - 1;

    const saveBtn = document.getElementById("saveChangesBtn");
    saveBtn.onclick = async () => {
      const updatedData = {
        Question: document.getElementById("editQuestionText").value,
        A: document.getElementById("editOptionA").value,
        B: document.getElementById("editOptionB").value,
        C: document.getElementById("editOptionC").value,
        D: document.getElementById("editOptionD").value,
        Answer:
          parseInt(document.getElementById("editCorrectOption").value) + 1,
      };

      // Update the question in Firestore
      await updateDoc(questionRef, updatedData);
      location.reload();
      // Close the modal after saving changes
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editModal")
      );
      modal.hide();

      // Reload questions
    };

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();

    // Close the modal when the close button is clicked
    const closeBtn = document.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modalInstance = bootstrap.Modal.getInstance(
          document.getElementById("editModal")
        );
        modalInstance.hide();
      });
    }
  } catch (error) {
    console.error("Error editing question: ", error);
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

      // Add new question to Firestore
      const questionRef = collection(db, "Questions");
      await addDoc(questionRef, newQuestionData);

      // Close the modal
      const modal = new bootstrap.Modal(document.getElementById("addModal"));
      modal.hide();

      // Reload questions (or you could just add it dynamically without reload)
      location.reload();
    } catch (error) {
      console.error("Error adding question: ", error);
    }
  });

// Delete a question
async function deleteQuestion(questionId) {
  try {
    const questionRef = doc(db, "Questions", questionId);
    await deleteDoc(questionRef);
    location.reload();
  } catch (error) {
    console.error("Error deleting question: ", error);
  }
}

// Load questions when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
});

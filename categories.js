// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  addDoc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  increment,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw",
  authDomain: "cetapp-5ef90.firebaseapp.com",
  projectId: "cetapp-5ef90",
  storageBucket: "cetapp-5ef90.appspot.com",
  messagingSenderId: "710169034602",
  appId: "1:710169034602:web:47b6b7703fd292e3ebef13",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let courseName = localStorage.getItem("CollectionName");

// Load categories on document load
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");
  document.getElementById("uname").innerText = user;
  loadCategories();

  // Attach event listener to the "Create Category" button
  const createCategoryButton = document.getElementById("createCategoryButton");
  if (createCategoryButton) {
    createCategoryButton.addEventListener("click", handleCreateCategory);
  }
});

// Function to load categories from Firestore and render them in the HTML
async function loadCategories() {
  try {
    const categoryContainer = document.querySelector(".row");
    categoryContainer.innerHTML = ""; // Clear previous content

    // Fetch categories from Firestore
    const querySnapshot = await getDocs(collection(db, courseName));
    const docList = {};

    querySnapshot.forEach((doc) => {
      docList[doc.id] = doc;
    });

    const catListDoc = docList["Categories"];
    if (!catListDoc) return;

    const catData = catListDoc.data();
    const catCount = catData["COUNT"];

    for (let i = 1; i <= catCount; i++) {
      const catId = catData[`CAT${i}_ID`];
      const catDoc = docList[catId];

      if (catDoc) {
        const {
          NAME: catName,
          IMG_LINK: imgLink,
          NO_OF_TESTS: noOfTests,
        } = catDoc.data();

        const categoryCard = document.createElement("div");
        categoryCard.classList.add("col-md-3");

        categoryCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <img class="imgLink" alt="${catName} Icon" height="50" src="${imgLink}" width="50" />
                            <div class="progress">
                                <div class="progress-bar" style="width: 50%;"></div>
                            </div>
                            <p class="courseName">${catName}</p>
                            <button class="btn take-test-btn" data-cat-id="${catId}" data-cat-name="${catName}" data-no-of-tests="${noOfTests}">Take Test</button>
                            <button class="btn btn-warning edit-category-btn" data-cat-id="${catId}">Edit</button>
                            <button class="btn btn-danger delete-category-btn" data-cat-id="${catId}">Delete</button>
                        </div>
                    </div>
                `;

        categoryContainer.appendChild(categoryCard);
      }
    }

    attachEventListeners();
    // Attach event listeners to "Take Test" buttons programmatically
    document.querySelectorAll(".take-test-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const catId = e.target.getAttribute("data-cat-id");
        const catName = e.target.getAttribute("data-cat-name");
        const noOfTests = e.target.getAttribute("data-no-of-tests");

        // Save data to local storage
        if (localStorage.length === 0) {
          localStorage.setItem("user", user);
        }
        localStorage.setItem("catId", catId);
        localStorage.setItem("catName", catName);
        localStorage.setItem("noOfTests", noOfTests);

        // Redirect to sets.html without query parameters
        window.location.href = "sets.html";
      });
    });
  } catch (error) {
    console.error("Error loading categories: ", error);
  }
}
async function handleCreateCategory() {
  const catName = prompt("Enter the new category name:");
  const imgLink = prompt("Enter the image link for the category:");
  const posMarks = prompt("Enter the positive marks for tests:");
  const negMarks = prompt("Enter the negative marks for tests:");

  if (!catName || !imgLink || posMarks === null || negMarks === null) return;

  try {
    const newCategory = {
      NAME: catName,
      IMG_LINK: imgLink,
      NO_OF_TESTS: 0,
    };

    // Add the new category to Firestore
    const docRef = await addDoc(collection(db, courseName), newCategory);
    console.log("New category added with ID:", docRef.id);

    // Add TESTS_LIST collection with a document named TESTS_INFO
    const testsInfoRef = doc(
      db,
      courseName,
      docRef.id,
      "TESTS_LIST",
      "TESTS_INFO"
    );
    await setDoc(testsInfoRef, {
      PosMarks: Number(posMarks),
      NegMarks: Number(negMarks),
    });

    // Update the "Categories" document with the new category ID
    const categoriesDocRef = doc(db, courseName, "Categories");
    const categoriesDoc = await getDoc(categoriesDocRef);
    const categoriesData = categoriesDoc.exists()
      ? categoriesDoc.data()
      : { COUNT: 0 };

    const newCount = (categoriesData.COUNT || 0) + 1;
    await updateDoc(categoriesDocRef, {
      [`CAT${newCount}_ID`]: docRef.id,
      COUNT: newCount,
    });

    alert("Category added successfully!");
    loadCategories(); // Reload categories to reflect the new addition
  } catch (error) {
    console.error("Error creating category:", error);
    alert("Failed to create category.");
  }
}

// Edit a category
async function updateCategory(catId, updatedData) {
  try {
    const catRef = doc(db, courseName, catId);
    await updateDoc(catRef, updatedData);
    console.log("Category updated successfully");
  } catch (error) {
    console.error("Error updating category: ", error);
  }
}

// Delete a category
async function deleteCategory(catId) {
  try {
    const categoryRef = doc(db, courseName, catId);

    // Get the Categories document to update the count
    const categoriesDocRef = doc(db, courseName, "Categories");
    const categoriesDocSnap = await getDoc(categoriesDocRef);

    if (categoriesDocSnap.exists()) {
      const categoriesData = categoriesDocSnap.data();

      // Find the category key to remove
      const catCount = categoriesData["COUNT"];
      const catKey = `CAT${catCount}_ID`;

      if (categoriesData[catKey] === catId) {
        await updateDoc(categoriesDocRef, {
          [catKey]: deleteField(),
          COUNT: increment(-1), // Decrease category count
        });
        console.log(
          `Category with ID ${catId} removed from the Categories document`
        );
      }
    }

    await deleteDoc(categoryRef);
    console.log("Category deleted successfully");
    loadCategories(); // Reload categories after deletion
  } catch (error) {
    console.error("Error deleting category: ", error);
  }
}

// Attach event listeners for edit and delete buttons
function attachEventListeners() {
  // Edit category
  document.querySelectorAll(".edit-category-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const catId = e.target.getAttribute("data-cat-id");
      const newCatName = prompt("Enter new category name:");
      const newImgLink = prompt("Enter new image link:");

      if (newCatName && newImgLink) {
        await updateCategory(catId, { NAME: newCatName, IMG_LINK: newImgLink });
        loadCategories();
      }
    });
  });

  // Delete category
  document.querySelectorAll(".delete-category-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const catId = e.target.getAttribute("data-cat-id");
      if (confirm("Are you sure you want to delete this category?")) {
        await deleteCategory(catId);
      }
    });
  });
}

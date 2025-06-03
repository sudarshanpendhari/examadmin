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
const _0x19e732 = _0x4893;
(function (_0x1942c8, _0x3d2c28) {
  const _0x2eda14 = _0x4893,
    _0x466bfb = _0x1942c8();
  while (!![]) {
    try {
      const _0x368d17 =
        (-parseInt(_0x2eda14(0xf1)) / 0x1) *
          (-parseInt(_0x2eda14(0xe9)) / 0x2) +
        parseInt(_0x2eda14(0xe7)) / 0x3 +
        parseInt(_0x2eda14(0xed)) / 0x4 +
        -parseInt(_0x2eda14(0xeb)) / 0x5 +
        -parseInt(_0x2eda14(0xee)) / 0x6 +
        (-parseInt(_0x2eda14(0xea)) / 0x7) * (parseInt(_0x2eda14(0xf0)) / 0x8) +
        (-parseInt(_0x2eda14(0xf3)) / 0x9) * (-parseInt(_0x2eda14(0xf4)) / 0xa);
      if (_0x368d17 === _0x3d2c28) break;
      else _0x466bfb["push"](_0x466bfb["shift"]());
    } catch (_0x49c608) {
      _0x466bfb["push"](_0x466bfb["shift"]());
    }
  }
})(_0x16c5, 0xee6e4);
function _0x4893(_0x22e5b5, _0x33da82) {
  const _0x16c5f4 = _0x16c5();
  return (
    (_0x4893 = function (_0x48933c, _0x195f1d) {
      _0x48933c = _0x48933c - 0xe7;
      let _0x5caed1 = _0x16c5f4[_0x48933c];
      return _0x5caed1;
    }),
    _0x4893(_0x22e5b5, _0x33da82)
  );
}
const fconf = {
  apiKey: _0x19e732(0xf2),
  authDomain: "cetapp-5ef90.firebaseapp.com",
  projectId: _0x19e732(0xe8),
  storageBucket: _0x19e732(0xef),
  messagingSenderId: _0x19e732(0xec),
  appId: "1:710169034602:web:47b6b7703fd292e3ebef13",
};
function _0x16c5() {
  const _0x393414 = [
    "3471858nrNCHW",
    "cetapp-5ef90",
    "2KWuWsA",
    "7iaJJxZ",
    "5168515JECxmu",
    "710169034602",
    "2357508LYcMkJ",
    "6839688qauVJa",
    "cetapp-5ef90.appspot.com",
    "1199784UWUjus",
    "47981VMMhEZ",
    "AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw",
    "17109DTQFzR",
    "7920EwlzGq",
  ];
  _0x16c5 = function () {
    return _0x393414;
  };
  return _0x16c5();
}

// Initialize Firebase and Firestore
const app = initializeApp(fconf);
const db = getFirestore(app);
const auth = getAuth(app);

let courseName = localStorage.getItem("CollectionName");

// Load categories on document load
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");
  document.getElementById("uname").innerText = user;
  loadCategories();

  const createCategoryButton = document.getElementById("createCategoryButton");
  if (createCategoryButton) {
    createCategoryButton.addEventListener("click", () => {
      document.getElementById("categoryModalLabel").innerText = "Add Category";
      document.getElementById("categoryId").value = "";
      document.getElementById("catName").value = "";
      document.getElementById("imgLink").value = "";
      document.getElementById("posMarks").value = "";
      document.getElementById("negMarks").value = "";
      document.getElementById("marksSection").classList.remove("d-none");
      new bootstrap.Modal(document.getElementById("categoryModal")).show();
    });
  }

  document
    .getElementById("categoryForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const catId = document.getElementById("categoryId").value;
      const catName = document.getElementById("catName").value;
      const imgLink = document.getElementById("imgLink").value;
      const posMarks = document.getElementById("posMarks").value;
      const negMarks = document.getElementById("negMarks").value;

      if (!catName || !imgLink || !posMarks || !negMarks)
        return alert("Please fill required fields.");

      if (catId) {
        // Update
        await updateCategory(
          catId,
          { NAME: catName, img_Link: imgLink },
          posMarks,
          negMarks
        );
      } else {
        // Create
        await handleCreateCategoryFromModal(
          catName,
          imgLink,
          posMarks,
          negMarks
        );
      }

      bootstrap.Modal.getInstance(
        document.getElementById("categoryModal")
      ).hide();
      //loadCategories();
    });
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
          img_Link: imgLink,
          NO_OF_TESTS: noOfTests,
        } = catDoc.data();

        const categoryCard = document.createElement("div");
        categoryCard.classList.add("col-md-3");

        categoryCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <img class="imgLink" alt="${catName} Icon" height="75vh" src="${imgLink}" width="120vw" />
                            <div class="progress">
                                <div class="progress-bar" style="width: 50%;"></div>
                            </div>
                            <p class="courseName">${catName}</p>
                            <button class="btn take-test-btn" data-cat-id="${catId}" data-cat-name="${catName}" data-no-of-tests="${noOfTests}">Visit</button>
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
async function handleCreateCategoryFromModal(
  catName,
  imgLink,
  posMarks,
  negMarks
) {
  try {
    const newCategory = {
      NAME: catName,
      img_Link: imgLink,
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
async function updateCategory(catId, updatedData, posMarks, negMarks) {
  try {
    const catRef = doc(db, courseName, catId);
    await updateDoc(catRef, updatedData);

    const testInfoRef = doc(db, courseName, catId, "TESTS_LIST", "TESTS_INFO");
    await updateDoc(testInfoRef, {
      PosMarks: Number(posMarks),
      NegMarks: Number(negMarks),
    });
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
      const catDoc = await getDoc(doc(db, courseName, catId));
      if (catDoc.exists()) {
        const data = catDoc.data();
        document.getElementById("categoryModalLabel").innerText =
          "Edit Category";
        document.getElementById("categoryId").value = catId;
        document.getElementById("catName").value = data.NAME;
        document.getElementById("imgLink").value = data.img_Link || "";
        document.getElementById("marksSection").classList.remove("d-none");
        const testInfoRef = doc(
          db,
          courseName,
          catId,
          "TESTS_LIST",
          "TESTS_INFO"
        );
        const testInfoSnap = await getDoc(testInfoRef);
        if (testInfoSnap.exists()) {
          const testData = testInfoSnap.data();
          document.getElementById("posMarks").value = testData.PosMarks ?? "";
          document.getElementById("negMarks").value = testData.NegMarks ?? "";
        } else {
          document.getElementById("posMarks").value = "";
          document.getElementById("negMarks").value = "";
        }
        new bootstrap.Modal(document.getElementById("categoryModal")).show();
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

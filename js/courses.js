import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  increment,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}

// Initialize Firebase and Firestore
const app = initializeApp(fconf);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("hi");
let courseModelList = [];

// Load courses on document load
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");
  document.getElementById("uname").innerText = user;
  loadCourses();

  // Attach event listener to the "Create Course" button
  const createCourseButton = document.getElementById("createCourseButton");
  if (createCourseButton) {
    createCourseButton.addEventListener("click", handleCreateCourse);
  }
});

// Function to load courses from Firestore and render them in the HTML
async function loadCourses() {
  try {
    const courseContainer = document.querySelector(".row");
    courseContainer.innerHTML = ""; // Clear previous content

    // Fetch courses from Firestore
    const querySnapshot = await getDocs(collection(db, "Course"));
    const docList = {};

    querySnapshot.forEach((doc) => {
      docList[doc.id] = doc;
    });

    const courseListDoc = docList["Courses"];
    if (!courseListDoc) return;

    const courseData = courseListDoc.data();
    const courseCount = courseData["COUNT"];

    for (let i = 1; i <= courseCount; i++) {
      const courseId = courseData[`Course${i}_ID`];
      const courseDoc = docList[courseId];
      if (courseDoc) {
        const { CollectionName, CourseName } = courseDoc.data();
        courseModelList.push({ CollectionName, CourseName });

        const courseCard = document.createElement("div");
        courseCard.classList.add("col-md-3");
        courseCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <div class="progress">
                                <div class="progress-bar" style="width: 50%;"></div>
                            </div>
                            <p class="courseName">${CourseName}</p>
                            <button class="btn take-test-btn" data-course-name="${CourseName}" data-collectionName="${CollectionName}">Visit</button>
                            <button class="btn btn-warning edit-course-btn" data-course-id="${courseId}">Edit</button>
                            <button class="btn btn-danger delete-course-btn" data-course-id="${courseId}">Delete</button>
                        </div>
                    </div>
                `;

        courseContainer.appendChild(courseCard);
      }
    }

    attachEventListeners();
  } catch (error) {
    console.error("Error loading courses: ", error);
  }
}

// Function to handle course creation
async function handleCreateCourse() {
  const courseName = prompt("Enter the new course name:");
  if (!courseName) return;

  try {
    const newCourse = {
      CourseName: courseName,
      CollectionName: `collection_${Date.now()}`,
    };

    // Add the new course to Firestore
    const docRef = await addDoc(collection(db, "Course"), newCourse);
    console.log("New course added with ID:", docRef.id);

    // Update the "Courses" document with the new course ID
    const coursesDocRef = doc(db, "Course", "Courses");
    const coursesDoc = await getDoc(coursesDocRef);
    const coursesData = coursesDoc.exists() ? coursesDoc.data() : { COUNT: 0 };

    const newCount = (coursesData.COUNT || 0) + 1;
    await updateDoc(coursesDocRef, {
      [`Course${newCount}_ID`]: docRef.id,
      COUNT: newCount,
    });

    alert("Course added successfully!");
    // Create a reference to the collection and document
    const docId = "Categories";
    const dref = doc(db, newCourse.CollectionName, docId);
    const data = {
      COUNT: 0,
    };
    // Set the document data
    await setDoc(dref, data);
    loadCourses(); // Reload courses to reflect the new addition
  } catch (error) {
    console.error("Error creating course:", error);
    alert("Failed to create course.");
  }
}

// Attach event listeners to buttons (Edit, Delete)
function attachEventListeners() {
  // Visit button
  document.querySelectorAll(".take-test-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const CourseName = e.target.getAttribute("data-course-name");
      const CollectionName = e.target.getAttribute("data-collectionName");
      if (localStorage.length === 0) {
        localStorage.setItem("user", user);
      }
      localStorage.setItem("CollectionName", CollectionName);
      localStorage.setItem("CourseName", CourseName);
      window.location.href = "categories.html";
    });
  });

  // Edit button
  document.querySelectorAll(".edit-course-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const courseId = e.target.getAttribute("data-course-id");
      const newCourseName = prompt("Enter new course name:");
      if (newCourseName) {
        await updateCourse(courseId, { CourseName: newCourseName });
        loadCourses();
      }
    });
  });
  // Update an existing course
  async function updateCourse(courseId, updatedData) {
    try {
      const courseRef = doc(db, "Course", courseId);
      await updateDoc(courseRef, updatedData);
      console.log("Course updated successfully");
    } catch (error) {
      console.error("Error updating course: ", error);
    }
  }

  // Delete a course
  async function deleteCourse(courseId) {
    try {
      // Reference to the course document that we want to delete
      const courseRef = doc(db, "Course", courseId);

      // Get the Courses document
      const coursesDocRef = doc(db, "Course", "Courses");
      const coursesDocSnap = await getDoc(coursesDocRef);
      // console.log(coursesDocRef," ",coursesDocSnap);
      if (coursesDocSnap.exists()) {
        const coursesData = coursesDocSnap.data();

        // Get the current count of courses and decrease it
        const currentCount = coursesData["COUNT"];

        // Find the course field we need to remove (like CourseX_ID)
        const courseCount = Object.keys(coursesData).filter(
          (key) => key.startsWith("Course") && key.endsWith("_ID")
        );

        // Find the course key to remove from the list
        const courseIndex = courseCount.findIndex(
          (courseKey) => coursesData[courseKey] === courseId
        );

        if (courseIndex !== -1) {
          // Remove the course reference from the Courses document
          const courseKeyToDelete = courseCount[courseIndex];
          await updateDoc(coursesDocRef, {
            [courseKeyToDelete]: deleteField(), // Remove the course ID
            COUNT: increment(-1), // Decrease the course count
          });
          console.log(
            `Course with ID ${courseId} removed from the Courses document`
          );
        }
      }

      await deleteDoc(courseRef);

      console.log("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course: ", error);
    }
  }

  // Delete button
  document.querySelectorAll(".delete-course-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const courseId = e.target.getAttribute("data-course-id");
      if (confirm("Are you sure you want to delete this course?")) {
        await deleteCourse(courseId);
        loadCourses();
      }
    });
  });
}

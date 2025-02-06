import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
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

const userTableBody = document.getElementById("userTableBody");
const userModal = new bootstrap.Modal(document.getElementById("userModal")); // Bootstrap modal instance

// Load users from Firestore
async function loadUsers() {
  userTableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "user"));

  querySnapshot.forEach((doc) => {
    let user = doc.data();

    // Ensure all fields exist before adding to the table
    if (user.email && user.name && user.collegeName && user.mobile) {
      let row = `
          <tr>
              <td>${user.email}</td>
              <td>${user.name}</td>
              <td>${user.collegeName}</td>
              <td>${user.mobile}</td>
              <td>
                  <button class="btn btn-warning btn-sm" onclick="editUser('${doc.id}', '${user.email}', '${user.name}', '${user.collegeName}', '${user.mobile}')">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteUser('${doc.id}')">Delete</button>
              </td>
          </tr>
      `;
      userTableBody.innerHTML += row;
    }
  });
}

// Open modal for adding/editing user
window.openModal = function (
  id = "",
  email = "",
  name = "",
  collegeName = "",
  mobile = ""
) {
  document.getElementById("userId").value = id;
  document.getElementById("userEmail").value = email;
  document.getElementById("userName").value = name;
  document.getElementById("userCollege").value = collegeName;
  document.getElementById("userMobile").value = mobile;
  document.getElementById("userModalLabel").innerText = id
    ? "Edit User"
    : "Add User";

  userModal.show(); // Show Bootstrap modal
};

// Save (Add/Update) user
window.saveUser = async function () {
  let userId = document.getElementById("userId").value;
  let email = document.getElementById("userEmail").value.trim();
  let name = document.getElementById("userName").value.trim();
  let collegeName = document.getElementById("userCollege").value.trim();
  let mobile = document.getElementById("userMobile").value.trim();

  if (!email || !name || !collegeName || !mobile) {
    alert("All fields are required!");
    return;
  }

  let userData = { email, name, collegeName, mobile };

  try {
    if (userId) {
      await updateDoc(doc(db, "user", userId), userData);
      alert("User updated successfully!");
    } else {
      await addDoc(collection(db, "user"), userData);
      alert("User added successfully!");
    }
    userModal.hide(); // Close modal after saving
    loadUsers(); // Reload user table
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

// Edit user
window.editUser = function (id, email, name, collegeName, mobile) {
  openModal(id, email, name, collegeName, mobile);
};

// Delete user
window.deleteUser = async function (userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await deleteDoc(doc(db, "user", userId));
      alert("User deleted successfully!");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
};

// Load users on page load
window.onload = loadUsers;

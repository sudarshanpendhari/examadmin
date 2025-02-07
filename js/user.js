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

const _0x19e732=_0x4893;(function(_0x1942c8,_0x3d2c28){const _0x2eda14=_0x4893,_0x466bfb=_0x1942c8();while(!![]){try{const _0x368d17=-parseInt(_0x2eda14(0xf1))/0x1*(-parseInt(_0x2eda14(0xe9))/0x2)+parseInt(_0x2eda14(0xe7))/0x3+parseInt(_0x2eda14(0xed))/0x4+-parseInt(_0x2eda14(0xeb))/0x5+-parseInt(_0x2eda14(0xee))/0x6+-parseInt(_0x2eda14(0xea))/0x7*(parseInt(_0x2eda14(0xf0))/0x8)+-parseInt(_0x2eda14(0xf3))/0x9*(-parseInt(_0x2eda14(0xf4))/0xa);if(_0x368d17===_0x3d2c28)break;else _0x466bfb['push'](_0x466bfb['shift']());}catch(_0x49c608){_0x466bfb['push'](_0x466bfb['shift']());}}}(_0x16c5,0xee6e4));function _0x4893(_0x22e5b5,_0x33da82){const _0x16c5f4=_0x16c5();return _0x4893=function(_0x48933c,_0x195f1d){_0x48933c=_0x48933c-0xe7;let _0x5caed1=_0x16c5f4[_0x48933c];return _0x5caed1;},_0x4893(_0x22e5b5,_0x33da82);}const fconf={'apiKey':_0x19e732(0xf2),'authDomain':'cetapp-5ef90.firebaseapp.com','projectId':_0x19e732(0xe8),'storageBucket':_0x19e732(0xef),'messagingSenderId':_0x19e732(0xec),'appId':'1:710169034602:web:47b6b7703fd292e3ebef13'};function _0x16c5(){const _0x393414=['3471858nrNCHW','cetapp-5ef90','2KWuWsA','7iaJJxZ','5168515JECxmu','710169034602','2357508LYcMkJ','6839688qauVJa','cetapp-5ef90.appspot.com','1199784UWUjus','47981VMMhEZ','AIzaSyCja31wklmLjFLwa4a2NRCiU8lub-MVofw','17109DTQFzR','7920EwlzGq'];_0x16c5=function(){return _0x393414;};return _0x16c5();}

// Initialize Firebase
const app = initializeApp(fconf);
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

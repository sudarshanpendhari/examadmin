// Retrieve values from local storage
const selectedCatId = localStorage.getItem("catId");
const selectedTestId = localStorage.getItem("testId");
const duration = localStorage.getItem("duration");
const pm = localStorage.getItem("posMarks");
const nm = localStorage.getItem("negMarks");
const cn = localStorage.getItem("catName");
const u = localStorage.getItem("user");

// Display profile name and course/test information
document.getElementById('profilenm').innerText = u;
document.querySelector(".t12").innerHTML = `${cn}: ${selectedTestId}`;
document.querySelector(".t17").innerHTML = `${cn}: ${selectedTestId}`;

// Full-screen request function (if needed)

// Event listener for Back to Tests button
document.getElementById("backtotests").addEventListener("click", () => {
    // Navigate back to the sets page
    window.location.href = "sets.html";
});

// Event listener for Start Exam button
document.getElementById("next").addEventListener("click", () => {
    // Navigate to the test page
    window.location.href = "test.html";
});

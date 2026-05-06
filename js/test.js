import { auth, db, rtdb } from "./firebase.js";

import {
    collection,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    ref,
    update,
    get
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";


// DOM
const heading = document.querySelector("#heading");
const dateEl = document.querySelector("#current-date");
const course = document.querySelector("#course");
const semester = document.querySelector("#semester");
const tableContainer = document.querySelector("#table-con");
const altTableContainer = document.querySelector("#alt-table-con");
const tableBody = document.querySelector("#tableBody");

// Initial UI state
tableContainer.style.display = "none";
altTableContainer.style.display = "block";

// Date
const todayKey = new Date().toLocaleDateString("en-CA");
dateEl.innerText = new Date().toDateString();

// Track previous selection
let prevCourse = null;
let prevSem = null;

// UPDATE HEADING + FETCH
function updateHeading() {
    const courseValue = course.value;
    const semValue = semester.value;
    console.log(courseValue);
    console.log(semValue);
    const semesterText = semester.options[semester.selectedIndex].text;
    heading.innerText = `${courseValue} - ${semesterText}`;

    if (
        courseValue !== "Select Department" &&
        semValue !== "Select Semester"
    ) {
        console.log(courseValue);
        console.log(semValue);
        const q = query(
            collection(db, "users"),
            where("role", "==", "student"),
            where("department", "==", courseValue),
            where("semester", "==", semValue),
            orderBy("rollNumber", "asc")
        );

        extractData(q, courseValue, semValue);
    }
}

course.addEventListener("change", updateHeading);
semester.addEventListener("change", updateHeading);

// MAIN LOGIC
async function extractData(q, courseValue, semValue) {

    // Reset UI only if selection changed
    if (prevCourse !== courseValue || prevSem !== semValue) {
        tableContainer.style.display = "none";
        altTableContainer.style.display = "block";
        altTableContainer.innerHTML = "";

        prevCourse = courseValue;
        prevSem = semValue;
    }

    try {
        // Show loader
        showLoader();

        const attendanceRef = ref(
            rtdb,
            `attendance/${courseValue}/${semValue}/${todayKey}`
        );

        const snapshot = await get(attendanceRef);

        // Clear loader
        altTableContainer.innerHTML = "";

        if (snapshot.exists()) {
            attendanceData = snapshot.val();
        }

        const attendanceData = snapshot.val();
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            altTableContainer.innerHTML = `<p>No students found</p>`;
            return;
        }

        // Show table
        altTableContainer.style.display = "none";
        tableContainer.style.display = "block";
        tableBody.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const roll = String(data.rollNumber).trim();

            const isPresent = attendanceData[roll] ?? false;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="stdRoll">${roll}</td>
                <td>${data.name}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${isPresent ? "checked" : ""}>
                        <span class="slider"></span>
                    </label>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error(err);
        altTableContainer.innerHTML = `<p>Error loading data</p>`;
    }
}

// LOADER
function showLoader() {
    altTableContainer.innerHTML = `
        <div id="pageLoader" style="display:flex; justify-content:center;">
            <div class="spinner"></div>
        </div>
    `;
}
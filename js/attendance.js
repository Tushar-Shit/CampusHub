import { auth, db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";



const heading = document.querySelector("#heading");
const date = document.querySelector("#current-date");
const course = document.querySelector("#course");
const semester = document.querySelector("#semester");
let courseValue = null;
// let semesterText;
let sem = null;
const months = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December"
};

const today = new Date().toDateString().split(" ");
date.innerText = `${today[0]}, ${months[today[1]]} ${today[2]}, ${today[3]}`;

function updateHeading() {
    courseValue = course.value;
    sem = semester.value;
    const semesterText = semester.options[semester.selectedIndex].text;
    heading.innerText = `${courseValue} - ${semesterText}`;

    if (course.value !== null &&
        course.value !== "Select Department" &&
        semester.value !== null &&
        semester.value !== "Select Semester") {
        const q = query(
            collection(db, "users"),
            where("department", "==", course.value),
            where("semester", "==", semester.value),
            where("role", "==", "student"),
            orderBy("rollNumber", "asc")
        );
        extractData(q);
    }
}

course.addEventListener("change", updateHeading);
semester.addEventListener("change", updateHeading);


//extract data from DB
const tableBody = document.querySelector("#tableBody");

async function extractData(q) {
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            return;
        }
        tableBody.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const row = document.createElement("tr");

            row.innerHTML = `<td>${data.collegeRoll}</td>
                        <td>${data.name}</td>
                        <td>
                            <label class="switch">
                                <input type="checkbox">
                                <span class="slider"></span>
                            </label>
                        </td>
            `;

            tableBody.appendChild(row);
        });
    })
}
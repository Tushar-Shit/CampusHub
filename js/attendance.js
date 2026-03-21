import { auth, db, rtdb } from "./firebase.js";
import {
    collection,
    onSnapshot,
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

import { ref, update, get} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const heading = document.querySelector("#heading");
const date = document.querySelector("#current-date");
const course = document.querySelector("#course");
const semester = document.querySelector("#semester");
const tableBody = document.querySelector("#tableBody");
let courseValue = null;
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
async function extractData(q) {
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            return;
        }
        tableBody.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const row = document.createElement("tr");
            row.innerHTML = `<td class="stdRoll">${data.rollNumber}</td>
                        <td">${data.name}</td>
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

let teacherName = "";
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            teacherName = userSnap.data().name;
        }
    }
});

//update in DB
const saveBtn = document.querySelector("#btn-save");
const back = document.querySelector("#back");
const atDate = document.querySelector("#date");
const teacher = document.querySelector("#teacher-name");
const present = document.querySelector("#present");
const absent = document.querySelector("#absent");
let adate, stdpresent = 0, stdabsent = 0;
saveBtn.addEventListener("click", async () => {
    const rows = tableBody.querySelectorAll("tr");

    if (rows.length === 0) {
        alert("No data found");
        return;
    }

    let attendanceData = {};

    rows.forEach((row) => {
        const stdRoll = row.querySelector(".stdRoll").innerText;
        const checkbox = row.querySelector("input[type='checkbox']");
        const isPresent = checkbox.checked;
        if (isPresent)
            stdpresent++;
        else
            stdabsent++;

        attendanceData[stdRoll] = isPresent;
    });

    attendanceData["Teacher"] = teacherName;
    const today = new Date();
    adate = today.toLocaleDateString('en-CA');
    console.log(adate)
    console.log(attendanceData);

    atDate.innerHTML = `Attendance for <b>${adate}</b>`;
    teacher.innerHTML = `Taken by <b>${teacherName}</b>`;
    present.innerHTML = `Total present ${stdpresent}`;
    absent.innerHTML = `Total absent ${stdabsent}`;

    back.classList.toggle("state-hide");
    await update(ref(rtdb, `attendance/${courseValue}/${sem}/${adate}`), attendanceData);
    stdpresent = 0, stdabsent = 0;
    reset();
    // window.location.reload();
});


const crossBtn = document.querySelector("#fea-cross-btn");
crossBtn.addEventListener("click", () => {
    back.classList.toggle("state-hide");
})

function reset() {
    back.classList.toggle("state-hide");
    course.value = "";
    semester.value = "";
    tableBody.innerHTML = "";
    heading.innerText = "";
    present.innerText = "";
    absent.innerText = "";
    teacher.innerText = "";
    atDate.innerText = "";
}


// const editBtn = document.querySelector("#btn-edit");
// editBtn.addEventListener("click", async () => {

//     const date = new Date().toISOString().split("T")[0];

//     if (tableBody.children.length === 0) {
//         alert("Load students first");
//         return;
//     }

//     console.log("Fetching:", courseValue, sem, date);

//     const attendanceRef = ref(rtdb, `attendance/${courseValue}/${sem}/${date}`);
//     const snapshot = await get(attendanceRef);

//     if (!snapshot.exists()) {
//         alert("No attendance found");
//         return;
//     }

//     const data = snapshot.val();
//     console.log("Data:", data);

//     const rows = tableBody.querySelectorAll("tr");

//     rows.forEach((row) => {
//         const roll = row.querySelector(".stdRoll").innerText.trim();
//         const checkbox = row.querySelector("input[type='checkbox']");

//         if (data[roll] !== undefined) {
//             checkbox.checked = data[roll];
//         }
//     });

//     back.classList.add("state-hide");
// });


const editBtn = document.querySelector("#btn-edit");

editBtn.addEventListener("click", async () => {
    try {
        // ✅ Validate selection
        if (!courseValue || !sem) {
            alert("Please select course and semester first");
            return;
        }

        const date = new Date().toLocaleDateString('en-CA');;

        // ✅ 1. Fetch attendance
        const attendanceRef = ref(rtdb, `attendance/${courseValue}/${sem}/${date}`);
        const snapshot = await get(attendanceRef);

        if (!snapshot.exists()) {
            alert("No attendance found for today");
            return;
        }

        const attendanceData = snapshot.val();

        // ✅ 2. Fetch students
        const q = query(
            collection(db, "users"),
            where("department", "==", courseValue),
            where("semester", "==", sem),
            where("role", "==", "student"),
            orderBy("rollNumber", "asc")
        );

        const querySnapshot = await getDocs(q);

        // ✅ 3. Clear table
        tableBody.innerHTML = "";

        // ✅ 4. Render + apply attendance
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

        // ✅ Close popup
        back.classList.add("state-hide");

    } catch (error) {
        console.error("Edit error:", error);
        alert("Something went wrong");
    }
});
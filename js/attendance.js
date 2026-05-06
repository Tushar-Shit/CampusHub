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

import { onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import { ref, update, get }
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";


// DOM
const heading = document.querySelector("#heading");
const dateEl = document.querySelector("#current-date");
const course = document.querySelector("#course");
const semester = document.querySelector("#semester");
const tableContainer = document.querySelector("#table-con");
const altTableContainer = document.querySelector("#alt-table-con");
const tableBody = document.querySelector("#tableBody");
const extrainfo = document.querySelector(".extra-data");
const teachername = document.querySelector("#teacher");
const avg = document.querySelector("#clsavg");
const pageLoader = document.querySelector("#pageLoader");
const body = document.querySelector("body");

// UI Init
extrainfo.style.display = "none";
tableContainer.style.display = "none";
altTableContainer.style.display = "block";

// Date
const todayKey = new Date().toLocaleDateString("en-CA");
dateEl.innerText = new Date().toDateString();

// Track selection
let prevCourse = null;
let prevSem = null;
//send percentage to another file
let percentToBeSend;

// ================= UPDATE =================
function updateHeading() {
    const courseValue = course.value;
    const semValue = semester.value;

    const semesterText = semester.options[semester.selectedIndex].text;
    heading.innerText = `${courseValue} - ${semesterText}`;

    // ✅ RESET extra data on change
    extrainfo.style.display = "none";
    teachername.innerText = "";

    if (
        courseValue === "Select Department" ||
        semValue === "Select Semester"
    ) return;

    const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("department", "==", courseValue),
        where("semester", "==", semValue),
        orderBy("rollNumber", "asc")
    );

    extractData(q, courseValue, semValue);
}

course.addEventListener("change", updateHeading);
semester.addEventListener("change", updateHeading);


// ================= MAIN =================
async function extractData(q, courseValue, semValue) {

    if (prevCourse !== courseValue || prevSem !== semValue) {

        tableContainer.style.display = "none";
        altTableContainer.style.display = "block";
        altTableContainer.innerHTML = "";

        prevCourse = courseValue;
        prevSem = semValue;
    }

    try {
        showLoader();
        const attendanceTodayRef = ref(
            rtdb,
            `attendance/${courseValue}/${semValue}/${todayKey}`
        );

        const attendanceAllRef = ref(
            rtdb,
            `attendance/${courseValue}/${semValue}`
        );

        const [todaySnap, allSnap, querySnapshot] = await Promise.all([
            get(attendanceTodayRef),
            get(attendanceAllRef),
            getDocs(q)
        ]);

        altTableContainer.innerHTML = "";
        pageLoader.style.display = "none";

        if (querySnapshot.empty) {
            altTableContainer.innerHTML = `<p>No students found</p>`;
            return;
        }

        // ✅ FIXED: Attendance today + teacher logic
        let attendanceToday = {};

        if (todaySnap.exists()) {
            attendanceToday = todaySnap.val();

            const teacher = attendanceToday["Teacher"];

            if (teacher) {
                teachername.innerText = teacher;
                extrainfo.style.display = "flex";
            } else {
                teachername.innerText = "";
                extrainfo.style.display = "none";
            }

        } else {
            teachername.innerText = "";
            extrainfo.style.display = "none";
        }

        // All attendance (history)
        let allAttendance = {};
        if (allSnap.exists()) {
            allAttendance = allSnap.val();
        }

        // ===== CALCULATIONS =====
        const studentList = [];
        let totalStudents = 0;
        let totalClasses = 0;
        let totalPresentAll = 0;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const roll = String(data.rollNumber).trim();

            const { percentage, present, absent, classes } =
                calculateDetails(roll, allAttendance);

            totalStudents++;
            totalClasses = classes;
            totalPresentAll += present;

            studentList.push({
                roll,
                name: data.name,
                percentage,
                present,
                absent
            });
        });

        // ===== CLASS AVERAGE =====
        let average = 0;
        if (totalStudents > 0 && totalClasses > 0) {
            average = (
                totalPresentAll / (totalStudents * totalClasses)
            ) * 100;

        }
        const cdxss = average >= 75 ? "green" : average >= 50 ? "orange" : "red";
        avg.innerText = `${average.toFixed(2)}%`;
        avg.style.color = cdxss;

        // ===== RENDER =====
        altTableContainer.style.display = "none";
        tableContainer.style.display = "block";
        tableBody.innerHTML = "";

        studentList.forEach((student) => {

            const isPresent = attendanceToday[student.roll] ?? false;

            const row = document.createElement("tr");

            let color = "red";
            if (student.percentage >= 75) color = "green";
            else if (student.percentage >= 50) color = "orange";

            row.innerHTML = `
                <td class="stdRoll center">${student.roll}</td>
                <td>${student.name}</td>
                <td class="center" style="color:${color}">
                    <b>${student.percentage}%</b>
                </td>
                <td class="center">${student.present}</td>
                <td class="center">${student.absent}</td>
                <td class="center">
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
        pageLoader.style.display = "none";
        altTableContainer.innerHTML = `<p>Error loading data</p>`;
    }
}


// ================= CALCULATE =================
function calculateDetails(roll, allAttendance) {

    let totalClasses = 0;
    let presentCount = 0;

    for (let date in allAttendance) {
        const dayData = allAttendance[date];
        totalClasses++;

        if (dayData[roll]) {
            presentCount++;
        }
    }

    const percentage = totalClasses > 0
        ? ((presentCount / totalClasses) * 100).toFixed(2)
        : 0;
    percentToBeSend = percentage;
    const absent = totalClasses - presentCount;

    return {
        percentage,
        present: presentCount,
        absent,
        classes: totalClasses
    };
}


// ================= LOADER =================
function showLoader() {
    pageLoader.style.display = "flex";
}


// ================= AUTH =================
let teacherName = "";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
        teacherName = userSnap.data().name;
    }
});


// ================= SAVE =================
const saveBtn = document.querySelector("#btn-save");
const back = document.querySelector("#back");
const atDate = document.querySelector("#date");
const teacher = document.querySelector("#teacher-name");
const present = document.querySelector("#present");
const absent = document.querySelector("#absent");

saveBtn.addEventListener("click", async () => {

    const rows = tableBody.querySelectorAll("tr");

    if (rows.length === 0) {
        alert("No data found");
        return;
    }

    const courseValue = course.value;
    const semValue = semester.value;

    let stdpresent = 0;
    let stdabsent = 0;
    let attendanceData = {};

    rows.forEach((row) => {
        const stdRoll = row.querySelector(".stdRoll").innerText;
        const checkbox = row.querySelector("input[type='checkbox']");

        const isPresent = checkbox.checked;

        if (isPresent) stdpresent++;
        else stdabsent++;

        attendanceData[stdRoll] = isPresent;
    });

    attendanceData["Teacher"] = teacherName;

    atDate.innerHTML = `Attendance for <b>${todayKey}</b>`;
    teacher.innerHTML = `Taken by <b>${teacherName}</b>`;
    present.innerHTML = `Total present ${stdpresent}`;
    absent.innerHTML = `Total absent ${stdabsent}`;

    try {
        await update(
            ref(rtdb, `attendance/${courseValue}/${semValue}/${todayKey}`),
            attendanceData
        );

        back.classList.remove("state-hide");
        body.style.overflow = "hidden";

    } catch (err) {
        console.error(err);
        alert("Failed to save attendance");
    }
});


// ================= BACK =================
back.addEventListener("click", () => {
    window.location.href = "/teacher/teacher-home.html";
});

export{percentToBeSend};
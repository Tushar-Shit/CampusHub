import {
    auth,
    db,
    rtdb
} from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const welcomeText = document.getElementById("welcomeText");
const mainCard = document.getElementById("main-card");
const mobileIcon = document.getElementById("mobile-icon");
const todayDate = document.getElementById("today-date");
const statusTitle = document.getElementById("status-title");
const statusMessage = document.getElementById("status-message");
const pageLoader = document.getElementById("pageLoader");
const ihgdtyh = document.getElementById("ihgdtyh");
const totalPresent = document.getElementById("totalPresent");
const totalAbsent = document.getElementById("totalAbsent");
const present = document.getElementById("present");

const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});


const aaatoday = new Date();


const todayKey = aaatoday.toLocaleDateString('en-CA');

todayDate.innerHTML = today;

ihgdtyh.style.display = "none";
pageLoader.style.display = "flex";

onAuthStateChanged(auth, async (user) => {

    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                welcomeText.innerHTML = `Hey, ${userData.name} Here's your attendance overview.`;

                await fetchAttendance(userData.department, userData.semester, todayKey, userData.rollNumber);


                calculateAttendance(userData.department, userData.semester, userData.rollNumber);

                pageLoader.style.display = "none";
                ihgdtyh.style.display = "block";
            }
        } catch (error) {
            console.error("error..");
        }

    } else {
        location.href = "../index.html";
        return;
    }

});


async function fetchAttendance(course, sem, date, roll) {
    try {
        const attendanceRef = ref(rtdb, `attendance/${course}/${sem}/${date}`);
        const snapshot = await get(attendanceRef);

        if (snapshot.exists()) {
            const data = snapshot.val();

            if (data[roll] !== undefined) {
                const status = data[roll];
                showTodayAttendance(status);
            }
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
    }
}

function showTodayAttendance(status) {
    if (status) {
        mainCard.style.backgroundColor = "#F0FDF4";
        mainCard.style.border = "2px solid #BBF7D0";
        mobileIcon.innerHTML = `
    <svg class="rtyui" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
        <path d="m9 11 3 3L22 4"></path>
    </svg>`;
        statusTitle.innerHTML = "Present";
        statusTitle.style.color = "#166534"
        statusMessage.innerHTML = "Excellent! You arrived to class on time today.";
    }
    else {
        mainCard.style.backgroundColor = "#FEF2F2";
        mainCard.style.border = "2px solid #FECACA";
        mobileIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        data-lucide="x-circle" aria-hidden="true" style="width: 48px; height: 48px;"
        class="lucide lucide-x-circle">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m15 9-6 6"></path>
        <path d="m9 9 6 6"></path>
    </svg>`;
        statusTitle.innerHTML = "Absent";
        statusTitle.style.color = "#991b1b";
        statusMessage.innerHTML = "You are absent today. Please submit a leave application if required.";
    }
}

async function calculateAttendance(course, sem, roll) {
    try {
        const attendanceRef = ref(rtdb, `attendance/${course}/${sem}`);
        const snapshot = await get(attendanceRef);

        if (!snapshot.exists()) {
            console.log("No attendance data found");
            return;
        }

        const data = snapshot.val();

        let totalClasses = 0;
        let presentCount = 0;

        for (let date in data) {
            const dayData = data[date];

            totalClasses++;

            if (dayData[roll]) {
                presentCount++;
            }
        }

        const percentage = totalClasses > 0
            ? ((presentCount / totalClasses) * 100).toFixed(2)
            : 0;

        totalPresent.innerText = `${presentCount} Days`;
        totalAbsent.innerText = `${totalClasses - presentCount} Days`;
        present.innerText = `${percentage}%`;
    } catch (error) {
        console.error("Error:", error);
    }
}
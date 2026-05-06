import { auth, db, rtdb } from "./firebase.js";

import { ref, update, get }
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
// import {percentToBeSend} from "./attendance.js";
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

//if teacher isnot signed in redirect to website landing page
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "../index.html"; return; }
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
        window.location.href = "../index.html";
        return;
    }
    const role = userDoc.data().role;
    if (role !== "teacher" && role !== "admin") {
        await signOut(auth);
        window.location.href = "../index.html";
    }
});

//left corner text
const stream = localStorage.getItem("stream");
const mainHeading = document.querySelector("#heading");
mainHeading.innerText = `${stream} SEMESTERS`;

//stream object
const departmentOfStudent = {
    "BCA": "BC",
    "BBA": "BB",
    "BHM": "BHM",
    "BMLT": "BMLT"
}

//for date generate
const todayKey = new Date().toLocaleDateString("en-CA");

//global variables
let unsubscribe = null;
let currentClick = null;
let whichBtn = null;


const container = document.querySelector("#sem-container");
const rightSide = document.querySelector("#right-side");
const altRightSide = document.querySelector("#alternative-right-side");
const rightHeading = document.querySelector("#right-heading");
const spBtnContainer = document.querySelector("#right-top");
const rightBottom = document.querySelector("#right-bottom");
const featureCrossButton = document.querySelector("#fea-cross-btn");
let pageLoader = document.getElementById("pageLoader");


//initial state set
rightSide.style.display = "none";
altRightSide.style.display = "block";
rightBottom.style.display = "none";

//semester selection logic
container.addEventListener("click", (e) => {
    if (e.target.nodeName !== "BUTTON") return;

    if (currentClick === e.target) {
        resetSemester();
        return;
    }

    if (currentClick) resetSemester();

    selectSemester(e.target);
});

//reset semester buttons
function resetSemester() {
    currentClick.classList.remove("clicked-bgcolor");
    currentClick.classList.add("pre-bgcolor", "forhover");
    rightSide.style.display = "none";
    altRightSide.style.display = "block";
    currentClick = null;
}

//select semester button logic
function selectSemester(btn) {
    btn.classList.remove("pre-bgcolor", "forhover");
    btn.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";
    rightBottom.style.display = "block";

    rightHeading.innerText = `${stream} ${btn.innerText}`;
    currentClick = btn;
    studentList(currentClick.value);
}






async function studentList(sem) {
    pageLoader = rightBottomLoader();

    const q = query(
        collection(db, "users"),
        where("department", "==", stream),
        where("semester", "==", sem),
        where("role", "==", "student"),
        orderBy("rollNumber", "asc")
    );

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, async (snapshot) => {

        rightBottom.innerHTML = "";

        if (snapshot.empty) {
            rightBottom.innerHTML =
                `<p class="inner" style="justify-self:center;">
                No Records Available
            </p>`;
            return;
        }

        // fetch attendance only once
        const attendanceRef = ref(
            rtdb,
            `attendance/${stream}/${sem}`
        );

        const attendanceSnap = await get(attendanceRef);

        let attendanceData = {};

        if (attendanceSnap.exists()) {
            attendanceData = attendanceSnap.val();
        }

        for (const docSnap of snapshot.docs) {

            const data = docSnap.data();

            let totalClasses = 0;
            let presentCount = 0;

            Object.values(attendanceData).forEach((dayData) => {

                totalClasses++;

                if (dayData[data.rollNumber] === true) {
                    presentCount++;
                }

            });

            const percentage = totalClasses > 0
                ? ((presentCount / totalClasses) * 100).toFixed(2)
                : 0;
            const cdxss = percentage >= 75 ? "green" : percentage >= 50 ? "orange" : "red";

            const row = document.createElement("div");

            row.className = "student-card-horizontal";

            row.innerHTML = `
            <div class="roll-tag">${data.rollNumber}</div>

            <div class="dcon">
                <h2 id="std-name">${data.name}</h2>
                <p id="des">Batch of ${data.admissionYear}</p>
            </div>

            <div class="minor">
                <span class="value">${data.universityRoll}</span>
                <span class="value">${data.mobile}</span>
                <span class="value" style="padding-right:10px;">
                    ${data.email}
                </span>

                <span class="value" style="border:none; color:${cdxss}">
                    ${percentage}%
                </span>
            </div>

            <button id="std-edit-by-tea" class="edit-btn">
                Edit
            </button>
        `;

            rightBottom.appendChild(row);

            const passData = [
                row,
                data.collegeRoll,
                data.universityRoll,
                docSnap.id,
                data.admissionYear,
                data.semester,
                data.department,
                data.name
            ];

            editStudentDetails(passData);
        }
    });
}



async function editStudentDetails(passData) {
    const [row, clgdata, unidata, userId, admyear, semester, department, name] = passData;
    const editBtn = row.querySelector("#std-edit-by-tea");
    const stdEditpopup = document.querySelector("#std-edit-con");

    editBtn.addEventListener("click", (e) => {
        stdEditpopup.classList.remove("state-hide");

        const studentName = stdEditpopup.querySelector("h1");
        const admissionField = stdEditpopup.querySelector("#adm_year");
        const collegeRoll = stdEditpopup.querySelector("#clg_roll");
        const uniRoll = stdEditpopup.querySelector("#uni_roll");
        const semesterField = stdEditpopup.querySelector("#semester");
        const departmentField = document.querySelectorAll("input[name='edit-dept']");
        const submitBtn = stdEditpopup.querySelector("#jhifg");
        const [a, b, c] = clgdata.split('/');
        uniRoll.oninput = () => uniRoll.value = uniRoll.value.replace(/\D/g, "").slice(0, 11);

        let changedDept = department;
        const nameHeading = `${name.split(" ")[0]}'s Data`;
        studentName.innerText = nameHeading;
        admissionField.value = admyear;
        collegeRoll.value = c;
        uniRoll.value = unidata;
        semesterField.value = semester;
        departmentField.forEach((radio) => {
            if (radio.value.trim() === department) {
                radio.checked = true;
            }

            radio.addEventListener("change", () => {
                if (radio.checked) {
                    changedDept = radio.value;
                }
            });
        });


        submitBtn.onclick = async (e) => {
            e.preventDefault();
            if (collegeRoll.value < 1 || collegeRoll.value > 60 || collegeRoll.value.length > 2) {
                alert("Invalid college Roll, try again");
                return;
            }

            if (uniRoll.value.length !== 11) {
                alert("University roll must contain exactly 11 digits");
                return;
            }
            stdEditpopup.classList.toggle("state-hide");
            const newroll = `${departmentOfStudent[changedDept]}/${admissionField.value.slice(2)}/${collegeRoll.value}`;
            const roll = Number(collegeRoll.value);
            try {
                await updateDoc(doc(db, "users", userId), {
                    collegeRoll: newroll,
                    rollNumber: roll,
                    universityRoll: uniRoll.value,
                    admissionYear: admissionField.value,
                    semester: semesterField.value,
                    department: changedDept
                });
                // console.log("err");
            } catch (err) {
                console.log(err);
            }

        };
        //close button logic
        featureCrossButton.addEventListener("click", () => {
            stdEditpopup.classList.add("state-hide");

        });
    });

}


function rightBottomLoader() {
    rightBottom.innerHTML = `
    <div id="pageLoader">
        <div class="spinner"></div>
    </div>`;

    const pageLoader = document.getElementById("pageLoader");
    pageLoader.style.display = "flex";
    return pageLoader;
}
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;

import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { db } from "./firebase.js";

let unsubscribe = null;

const container = document.querySelector("#sem-container");
const rightSide = document.querySelector("#right-side");
const altRightSide = document.querySelector("#alternative-right-side");
const rightHeading = document.querySelector("#right-heading");
const spBtnContainer = document.querySelector("#right-top");
const rightBottom = document.querySelector("#right-bottom");
const altRightBottom = document.querySelector("#alternative-right-bottom");

let currentClick = null;
let whichBtn = null;

rightSide.style.display = "none";
altRightSide.style.display = "block";
rightBottom.style.display = "none";
altRightBottom.style.display = "block";

container.addEventListener("click", (e) => {
    if (e.target.nodeName !== "BUTTON") return;

    if (currentClick === e.target) {
        resetSemester();
        return;
    }

    if (currentClick) resetSemester();

    selectSemester(e.target);
});

function resetSemester() {
    currentClick.classList.remove("clicked-bgcolor");
    currentClick.classList.add("pre-bgcolor", "forhover");
    rightSide.style.display = "none";
    altRightSide.style.display = "block";
    currentClick = null;

    if (whichBtn) resetOptionButton();
}

function selectSemester(btn) {
    btn.classList.remove("pre-bgcolor", "forhover");
    btn.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";

    rightHeading.innerText = `${stream} ${btn.innerText}`;
    currentClick = btn;
}

spBtnContainer.addEventListener("click", (e) => {
    if (e.target.nodeName !== "BUTTON" || !currentClick) return;

    if (whichBtn === e.target) {
        resetOptionButton();
        return;
    }

    if (whichBtn) resetOptionButton();

    activateOptionButton(e.target);
    extractData(stream, currentClick.value, e.target.innerText);
});

function activateOptionButton(btn) {
    btn.classList.remove("before-clicked", "forhover");
    btn.classList.add("after-clicked");

    rightBottom.style.display = "block";
    altRightBottom.style.display = "none";

    whichBtn = btn;
}

function resetOptionButton() {
    whichBtn.classList.remove("after-clicked");
    whichBtn.classList.add("before-clicked", "forhover");

    rightBottom.style.display = "none";
    altRightBottom.style.display = "block";

    whichBtn = null;
}

async function extractData(department, semester, button) {

    if (button.trim() === "Student List") {
        const q = query(
            collection(db, "users"),
            where("department", "==", department),
            where("semester", "==", semester),
            where("role", "==", "student")
        );
        studentList(q);
        return;
    }

    const q = query(
        collection(db, "examApplications"),
        where("department", "==", department),
        where("semester", "==", semester)
    );

    if (button.trim() === "Pending Approval") {
        pendingApproval(q);
        return;
    }

    const querySnapshot = await getDocs(q);
    generatePDF(querySnapshot.docs.map(d => d.data()), semester);
}

function studentList(q) {
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        rightBottom.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            const row = document.createElement("div");
            row.className = "student-list-appear";

            row.innerHTML = `
                <span>${data.name}</span>
                <span>${data.collegeRoll}</span>
                <span>${data.universityRoll}</span>
                <span>+91 ${data.mobile}</span>
            `;

            rightBottom.appendChild(row);
        });
    });
}

function pendingApproval(q) {

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        rightBottom.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            const row = document.createElement("div");
            row.className = "pending-approval-list";

            row.innerHTML = `
            <div id="details_con">
                <span>${data.fullName}</span>
                <span>${data.clgRoll}</span>
                <span>${data.uniRoll}</span>
                <span>${data.status}</span>
            </div>
            <div id="buttons_con">
                <button class="approve">Approve</button>
                <button class="reject">Reject</button>
            </div>
            `;

            rightBottom.appendChild(row);

            const approve = row.querySelector(".approve");
            const reject = row.querySelector(".reject");

            approve.onclick = async () => {
                await updateDoc(doc(db, "examApplications", docSnap.id), { status: "Approved" });
            };

            reject.onclick = async () => {
                await updateDoc(doc(db, "examApplications", docSnap.id), { status: "Rejected" });
            };

            if (data.status.trim() === "Approved") {
                row.classList.add("change-bg-to-green");
                approve.style.display = "none";
            }

            if (data.status.trim() === "Rejected") {
                row.classList.add("change-bg-to-red");
                reject.style.display = "none";
            }
        });
    });
}

function generatePDF(data, semester) {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(`BCA ${semester} SEMESTER`, 105, 10, { align: "center" });
    pdf.text("Exam Application Status", 105, 20, { align: "center" });

    pdf.setFontSize(12);

    let y = 40;

    pdf.text("Sl No", 15, y);
    pdf.text("Student Name", 40, y);
    pdf.text("College Roll", 85, y);
    pdf.text("University Roll", 120, y);
    pdf.text("Status", 165, y);

    y += 10;

    data.forEach((d, i) => {

        if (y > 280) {
            pdf.addPage();
            y = 40;
        }

        pdf.text(String(i + 1), 15, y);
        pdf.text(d.fullName, 40, y);
        pdf.text(d.clgRoll, 85, y);
        pdf.text(d.uniRoll, 120, y);
        pdf.text(d.status, 165, y);

        y += 10;
    });

    pdf.save(`${stream} ${semester} SEMESTER .pdf`);
}

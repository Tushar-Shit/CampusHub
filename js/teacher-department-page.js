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


const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;

//stream object
const departmentOfStudent = {
    "BCA": "BC",
    "BBA": "BB",
    "BHM": "BHM",
    "BMLT": "BMLT"
}

let unsubscribe = null;

const container = document.querySelector("#sem-container");
const rightSide = document.querySelector("#right-side");
const altRightSide = document.querySelector("#alternative-right-side");
const rightHeading = document.querySelector("#right-heading");
const spBtnContainer = document.querySelector("#right-top");
const rightBottom = document.querySelector("#right-bottom");
const altRightBottom = document.querySelector("#alternative-right-bottom");
const featureCrossButton = document.querySelector("#fea-cross-btn");
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
    const pageLoader = rightBottomLoader();

    if (button.trim() === "Student List") {
        const q = query(
            collection(db, "users"),
            where("department", "==", department),
            where("semester", "==", semester),
            where("role", "==", "student"),
            orderBy("rollNumber", "asc")
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
    generatePDF(querySnapshot.docs.map(d => d.data()), semester, pageLoader);
}

async function studentList(q) {
    const pageLoader = rightBottomLoader();

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        if (snapshot.empty) {
            noDataMessage(pageLoader);
            return;
        }

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
                <button id="std-edit-by-tea" class="std-edit-by-tea">Edit</button>
            `;

            rightBottom.appendChild(row);

            const passData = [row, data.collegeRoll, data.universityRoll,
                docSnap.id, data.admissionYear, data.semester, data.department, data.name];
            editStudentDetails(passData);
        });
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

            await updateDoc(doc(db, "users", userId), {
                collegeRoll: newroll,
                universityRoll: uniRoll.value,
                admissionYear: admissionField.value,
                semester: semesterField.value,
                department: changedDept
            });

        };
        //close button logic
        featureCrossButton.addEventListener("click", () => {
            stdEditpopup.classList.add("state-hide");

        });
    });

}

function pendingApproval(q) {
    const pageLoader = rightBottomLoader();
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        if (snapshot.empty) {
            noDataMessage(pageLoader);
            return;
        }

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

function generatePDF(data, semester, pageLoader) {
    if (data.length === 0) {
        noDataMessage(pageLoader);
        return;
    }

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
    pageLoader.style.display = "none";
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

function noDataMessage(pageLoader) {
    rightBottom.innerHTML = `<p>No records available</p>`;
    pageLoader.style.display = "none";
    return;
}
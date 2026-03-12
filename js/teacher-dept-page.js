// extract stream names from local storage
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;


// importing essential items from firebase
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    where,
    getDocs
}
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { db } from "./firebase.js";


// 🔴 GLOBAL UNSUBSCRIBE VARIABLE
let unsubscribe = null;


// selection committee
const container = document.querySelector("#sem-container");
const rightSide = document.querySelector("#right-side");
const altRightSide = document.querySelector("#alternative-right-side");
const rightHeading = document.querySelector("#right-heading");
const spBtnContainer = document.querySelector("#right-top");
const rightBottom = document.querySelector("#right-bottom");
const altRightBottom = document.querySelector("#alternative-right-bottom");

rightSide.style.display = "none";
altRightSide.style.display = "block";

let currentClick = null;

rightBottom.style.display = "none";
altRightBottom.style.display = "block";


// semester click and ui changes
container.addEventListener("click", function (e) {

    if (e.target.nodeName !== "BUTTON") return;

    if (currentClick == null) {

        check(e.target);

    } else if (currentClick == e.target) {

        e.target.classList.remove("clicked-bgcolor");
        e.target.classList.add("pre-bgcolor", "forhover");

        rightSide.style.display = "none";
        altRightSide.style.display = "block";

        currentClick = null;

    } else {

        currentClick.classList.remove("clicked-bgcolor");
        currentClick.classList.add("pre-bgcolor", "forhover");

        rightBottom.style.display = "none";
        altRightBottom.style.display = "block";

        if (whichBtn !== null) {
            whichBtn.classList.remove("after-clicked");
            whichBtn.classList.add("before-clicked", "forhover");
            whichBtn = null;
        }

        check(e.target);
    }
});


// semester ui change
function check(tip) {

    tip.classList.remove("pre-bgcolor", "forhover");
    tip.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";

    rightHeading.innerText = `${stream} ${tip.innerText}`;

    currentClick = tip;
}



// required for option buttons
let currentSem = null;
let whichBtn = null;
let sem = null;


// option button click
spBtnContainer.addEventListener("click", function (e) {

    if (e.target.nodeName !== "BUTTON" || currentClick === null) return;

    sem = currentClick;

    if (whichBtn === null) {

        func(e.target, sem);
        currentSem = sem;

    } else if (whichBtn === e.target) {

        e.target.classList.remove("after-clicked");
        e.target.classList.add("forhover", "before-clicked");

        rightBottom.style.display = "none";
        altRightBottom.style.display = "block";

        whichBtn = null;

    } else {

        whichBtn.classList.remove("after-clicked");
        whichBtn.classList.add("before-clicked", "forhover");

        e.target.classList.remove("forhover", "before-clicked");
        e.target.classList.add("after-clicked");

        rightBottom.style.display = "block";
        altRightBottom.style.display = "none";

        whichBtn = e.target;

        extractData(stream, sem.value, e.target.innerText);
    }
});



function func(button, sem) {

    button.classList.remove("before-clicked", "forhover");
    button.classList.add("after-clicked");

    altRightBottom.style.display = "none";
    rightBottom.style.display = "block";

    whichBtn = button;

    extractData(stream, sem.value, button.innerText);
}



// fetch data from firebase
async function extractData(department, semester, button) {

    if (button.trim() === "Student List") {

        const q = query(
            collection(db, "users"),
            where("department", "==", department),
            where("semester", "==", semester),
            where("role", "==", "student")
        );

        studentList(q);
    }

    else if (button.trim() === "Pending Approval") {

        const q = query(
            collection(db, "examApplications"),
            where("department", "==", department),
            where("semester", "==", semester)
        );

        pendingApproval(q);
    }

    else {

        const q = query(
            collection(db, "examApplications"),
            where("department", "==", department),
            where("semester", "==", semester)
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => doc.data());

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(16);
        pdf.text(`${stream} ${semester} SEMESTER`, 105, 10, { align: "center" });
        pdf.text("Exam Application Status", 105, 20, { align: "center" });

        function drawHeader(y) {

            pdf.setFontSize(12);

            pdf.text("Sl No", 15, y);
            pdf.text("Student Name", 40, y);
            pdf.text("College Roll", 85, y);
            pdf.text("University Roll", 120, y);
            pdf.text("Status", 165, y);
        }

        drawHeader(40);

        let vertical = 50;
        let a = 1;

        for (let each of data) {

            if (vertical > 280) {

                pdf.addPage();

                pdf.setFontSize(16);
                pdf.text(`${stream} ${semester} SEMESTER`, 105, 10, { align: "center" });
                pdf.text("Exam Application Status", 105, 20, { align: "center" });

                drawHeader(40);

                vertical = 50;
            }

            pdf.text(String(a), 15, vertical);
            pdf.text(each.fullName, 40, vertical);
            pdf.text(each.clgRoll, 85, vertical);
            pdf.text(each.uniRoll, 120, vertical);
            pdf.text(each.status, 165, vertical);

            vertical += 10;
            a++;
        }

        pdf.save("exam-status.pdf");
    }
}



// student list realtime
function studentList(q) {

    const container2 = document.getElementById("right-bottom");

    // 🔴 remove previous listener
    if (unsubscribe)//false
        unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        container2.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            let newData = document.createElement("div");

            newData.classList.add("student-list-appear");

            newData.innerHTML = `
                <span>${data.name}</span>
                <span>${data.collegeRoll}</span>
                <span>${data.universityRoll}</span>
                <span>+91 ${data.mobile}</span>
            `;

            container2.appendChild(newData);
        });
    });
}



const container2 = document.getElementById("right-bottom");
// pending approval realtime
function pendingApproval(q) {


    // 🔴 remove previous listener
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        container2.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            let newData = document.createElement("div");

            newData.classList.add("pending-approval-list");

            if (data.status === "approved")
                newData.classList.add("change-bg-to-green");

            if (data.status === "rejected")
                newData.classList.add("change-bg-to-red");

            newData.innerHTML = `
                <div id="details_con">
                    <span>${data.fullName}</span>
                    <span>${data.clgRoll}</span>
                    <span>${data.uniRoll}</span>
                    <span>${data.status}</span>
                </div>

                <div id="buttons_con">
                    <button onclick="approve('${doc.id}',${container2})" id="approve-btn">Approve</button>
                    <button onclick="reject('${doc.id}')" id="reject-btn">Reject</button>
                </div>
            `;

            container2.appendChild(newData);
        });
    });
}



// approve
window.approve = async (id, btn) => {
    await updateDoc(doc(db, "examApplications", id), {
        status: "approved"
    });

}

window.reject = async (id) => {

    await updateDoc(doc(db, "examApplications", id), {
        status: "rejected"
    });
    // console.dir(btn);
    // btn.classList.add("change-bg-to-red");
    console.dir(container2);
    // container2.style.backgroundColor="#fe8282";
}


// pending
window.pending = async (id) => {

    await updateDoc(doc(db, "examApplications", id), {
        status: "pending"
    });
};
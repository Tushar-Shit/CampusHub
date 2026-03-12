//extract stream names from local storage
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;


//importing essential items from firebase
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query, where, getDocs
}
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { db } from "./firebase.js";

//Global declaration
let unsubscribe = null;

//selection commitee
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
//for specific button selection
rightBottom.style.display = "none";
altRightBottom.style.display = "block";



//semester click and ui changes 
container.addEventListener("click", function (e) {
    if (e.target.nodeName !== "BUTTON") return;

    if (currentClick == null) {
        check(e.target);
    }
    else if (currentClick == e.target) {
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


})
//semester click and ui changes 
function check(tip) {
    tip.classList.remove("pre-bgcolor", "forhover");
    tip.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";

    rightHeading.innerText = `${stream} ${tip.innerText}`;
    currentClick = tip;
}



//required for option buttons
let currentSem = null;
let whichBtn = null;
let sem = null;


//clicking option button
spBtnContainer.addEventListener("click", function (e) {
    if (e.target.nodeName !== "BUTTON" || currentClick === null) return;

    sem = currentClick;

    if (whichBtn === null) {
        func(e.target, sem);
        currentSem = sem;
    }
    else if (whichBtn === e.target) {
        e.target.classList.remove("after-clicked");
        e.target.classList.add("forhover", "before-clicked");

        rightBottom.style.display = "none";
        altRightBottom.style.display = "block";

        whichBtn = null;
    }
    else {
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

//clicking option button
function func(button, sem) {
    button.classList.remove("before-clicked", "forhover");
    button.classList.add("after-clicked");
    altRightBottom.style.display = "none";
    rightBottom.style.display = "block";
    whichBtn = button;
    extractData(stream, sem.value, button.innerText);
}




//fetch data from firebase based on option buttons
async function extractData(department, semester, button) {

    //for student list button
    if (button.trim() === "Student List") {
        const q = query(
            collection(db, "users"),
            where("department", "==", department),
            where("semester", "==", semester),
            where("role", "==", "student")
        );
        studentList(q);
    }
    //for pending approval button
    else if (button.trim() === "Pending Approval") {
        const q = query(
            collection(db, "examApplications"),
            where("department", "==", department),
            where("semester", "==", semester)
        );
        pendingApproval(q);
    }
    //for download the PDF
    else {
        const q = query(
            collection(db, "examApplications"),
            where("department", "==", department),
            where("semester", "==", semester)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(`BCA ${semester} SEMESTER`, 105, 10, { align: "center" });
        doc.text("Exam Application Status", 105, 20, { align: "center" });

        function drawHeader(y) {
            doc.setFontSize(12);
            doc.text("Sl No", 15, y);
            doc.text("Student Name", 40, y);
            doc.text("College Roll", 85, y);
            doc.text("University Roll", 120, y);
            doc.text("Status", 165, y);
        }

        drawHeader(40);
        let vertical = 50;
        let a = 1;

        for (let each of data) {

            if (vertical > 280) {

                doc.addPage();

                doc.setFontSize(16);
                doc.text("BCA 1ST SEMESTER", 105, 10, { align: "center" });
                doc.text("Exam Application Status", 105, 20, { align: "center" });

                drawHeader(40);

                vertical = 50;
            }

            doc.text(String(a), 15, vertical);
            doc.text(each.fullName, 40, vertical);
            doc.text(each.clgRoll, 85, vertical);
            doc.text(each.uniRoll, 120, vertical);
            doc.text(each.status, 165, vertical);

            vertical += 10;
            a++;
        }

        doc.save("exam-status.pdf");
    }
}




function studentList(q) {
    const container2 = document.getElementById("right-bottom");
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
                <span>+91 ${data.mobile}</span>`;
            container2.appendChild(newData);
        });

    });
}



const container2 = document.getElementById("right-bottom");

async function pendingApproval(q) {

    if (unsubscribe)
        unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {

        container2.innerHTML = "";

        snapshot.forEach((documentSnapshot) => {

            const data = documentSnapshot.data();

            let newData = document.createElement("div");
            newData.classList.add("pending-approval-list");


            newData.innerHTML = `
            <div id="details_con">
                <span>${data.fullName}</span>
                <span>${data.clgRoll}</span>
                <span>${data.uniRoll}</span>
                <span>${data.status}</span>
            </div>
            <div id="buttons_con">
                <button id="approve-btn">Approve</button>
                <button id="reject-btn">Reject</button>
            </div>`;

            container2.appendChild(newData);

            const approve = newData.querySelector("#approve-btn");
            const reject = newData.querySelector("#reject-btn");

            approve.addEventListener("click", async () => {

                await updateDoc(
                    doc(db, "examApplications", documentSnapshot.id),
                    { status: "Approved" }
                );

                // newData.classList.add("change-bg-to-green");

            });
            reject.addEventListener("click", async () => {

                await updateDoc(
                    doc(db, "examApplications", documentSnapshot.id),
                    { status: "Rejected" }
                );

                // newData.classList.add("change-bg-to-red");
                // newData.style.backgroundColor = "red";

            });




            if (data.status.trim() == "Approved") {
                newData.classList.add("change-bg-to-green");
                approve.style.display = "none";

            }
            if (data.status.trim() == "Rejected") {
                reject.style.display = "none";
                newData.classList.add("change-bg-to-red");
            }

        });

    });
}












window.approve = async (id) => {
    await updateDoc(doc(db, "examApplications", id), {
        status: "Approved"
    });
    console.dir(container2.style.backgroundColor = "pink")
}

// async function reject(id, bg) {

//     await updateDoc(doc(db, "examApplications", id), {
//         status: "rejected"
//     });
//     console.dir(bg.style.backgroundColor = "red")
// }


window.pending = async (id, btn) => {
    await updateDoc(doc(db, "examApplications", id), {
        status: "pending"
    });
}

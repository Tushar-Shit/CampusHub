//extract stream names from local storage
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;



import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query, where, getDocs
}
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { db } from "./firebase.js";



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



//clicking semester
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

function check(tip) {
    tip.classList.remove("pre-bgcolor", "forhover");
    tip.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";

    rightHeading.innerText = `${stream} ${tip.innerText}`;
    currentClick = tip;
}




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


function func(button, sem) {
    button.classList.remove("before-clicked", "forhover");
    button.classList.add("after-clicked");
    altRightBottom.style.display = "none";
    rightBottom.style.display = "block";
    whichBtn = button;
    extractData(stream, sem.value, button.innerText);
}





async function extractData(depertment, semester, button) {

    if (button === "Pending Approval") {
        const q = query(
            collection(db, "examApplications"),
            where("department", "==", depertment),
            where("semester", "==", semester)
        );
        fillUpData(q);

    }
    else if (button === "Student List") {
        console.log("fuck");
        // altRightBottom.style.display="block";
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
        //have to make change
    }
    else {
       const q = query(
            collection(db, "examApplications"),
            where("department", "==", depertment),
            where("semester", "==", semester)
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => doc.data());
        
        // const button = document.querySelector("#xyzz");

        // button.addEventListener("click", () => {

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
        // });
    }
}




function fillUpData(q) {

    const container2 = document.getElementById("right-bottom");

    onSnapshot(q, (snapshot) => {

        container2.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            let newData = document.createElement("div");

            if (data.status === "approved") {
                newData.classList.add("change-bg-to-green");
            }

            if (data.status === "rejected") {
                newData.classList.add("change-bg-to-red");
            }

            newData.innerHTML = `
                <span>${data.fullName}</span>
                <span>${data.clgRoll}</span>
                <span>${data.uniRoll}</span>

                <button onclick="approve('${doc.id}',this)">Approve</button>
                <button onclick="pending('${doc.id}',this)">Pending</button>
                <button onclick="reject('${doc.id}', this)">Reject</button>
            `;

                // <span>${data.department}</span>
                // <span>${data.semester}</span>
                // <span>${data.status}</span>
            container2.appendChild(newData);
        });

    });
}












window.approve = async (id, btn) => {
    await updateDoc(doc(db, "examApplications", id), {
        status: "approved"
    });

}

window.reject = async (id, btn) => {

    await updateDoc(doc(db, "examApplications", id), {
        status: "rejected"
    });
    btn.parentElement.classList.add("change-bg-to-red");
}


window.pending = async (id, btn) => {

    await updateDoc(doc(db, "examApplications", id), {
        status: "pending"
    });
}

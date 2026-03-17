import { db, auth } from "../js/firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

let userSemester = "";

const pageLoader = document.getElementById("pageLoader");
document.querySelector("#examForm").style.display = "none";
pageLoader.style.display = "flex";


const form = document.getElementById("examForm");
const box = document.getElementById("statusBox");

function queryUid(uid) {
    return query(
        collection(db, "examApplications"),
        where("uid", "==", uid)
    );
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
        window.location.href = "../index.html";
        return;
    }

    userSemester = userDoc.data().semester;
    const role = userDoc.data().role;

    if (role !== "student") {
        alert("Access denied");
        window.location.href = "../index.html";
        return;
    }
    else {
        document.querySelector("#examForm").style.display = "block";
        pageLoader.style.display = "none";
    }

    try {
        const q = queryUid(user.uid);

        onSnapshot(q, (snapshot) => {

            box.innerHTML = ""; // clear old data

            snapshot.forEach((docSnap) => {

                const data = docSnap.data();
                const div = document.createElement("div");

                div.style.border = "1px solid black";
                div.style.borderRadius = "10px";
                div.style.padding = "10px";
                div.style.margin = "10px";

                div.innerHTML = `
        Name: ${data.fullName}<br>
        Department: ${data.department}<br>
        Semester: ${data.semester}<br>
        Status: <span class="checkStatus">${data.status}</span>
        `;

                const checkStatus = div.querySelector(".checkStatus");

                if (data.status === "Approved") {
                    checkStatus.style.color = "#2e7d32";
                }
                else if (data.status === "Rejected") {
                    checkStatus.style.color = "#f50000";
                }
                else {
                    checkStatus.style.color = "black";
                }

                box.appendChild(div);

            });

        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});


form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const department = document.querySelector('input[name="department"]:checked')?.value;
    const semester = document.getElementById("semester").value;
    const clgRoll = document.getElementById("clgRoll").value;
    const uniRoll = document.getElementById("uniRoll").value;
    const mobile = document.getElementById("mobileNumber").value;

    if (!department) {
        alert("Select Department");
        return;
    }
    if (!semester) {
        alert("Select Semester")
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("User not logged in");
        return;
    }

    const q = queryUid(user.uid);

    const snapshot = await getDocs(q);

    if (userSemester !== semester) {
        alert(`You are from ${userSemester}.\nYou cannot apply for ${semester} semester.`);
        return;
    }

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (data.semester === semester &&
            (data.status === "Approved" || data.status === "Pending")) {

            alert(`Application already exists. Status: ${data.status}`);
            return;
        }
    }

    await addDoc(collection(db, "examApplications"), {
        uid: user.uid,
        fullName,
        department,
        semester,
        clgRoll,
        uniRoll,
        mobile,
        status: "Pending",
        createdAt: new Date()
    });

    alert("Application Submitted!");
    form.reset();

});




let userData = JSON.parse(sessionStorage.getItem("data"));
const formName = document.querySelector("#fullName");
const formSemester = document.querySelector("#semester");
const formRadio = document.querySelector(`input[name='department'][value=${userData.department}]`);
const formCollegeRoll = document.querySelector("#clgRoll");
const formUniRoll = document.querySelector("#uniRoll");
const formMobileNumber = document.querySelector("#mobileNumber");

formName.value = userData.name;
formUniRoll.value = userData.universityRoll;
formCollegeRoll.value = userData.collegeRoll;
formMobileNumber.value = userData.mobile;
formSemester.value = userData.semester;
if (formRadio) {
    formRadio.checked = true;
}


const statusBtn = document.getElementById("statusBtn");
const statusBox = document.getElementById("statusBox");
const examForm = document.getElementById("examForm");

statusBtn.addEventListener("click", () => {

    if (statusBox.style.display === "flex") {
        statusBox.style.display = "none";
        examForm.style.display = "block";
        statusBtn.textContent = "Check Status";
    }
    else {
        statusBox.style.display = "flex";
        statusBtn.textContent = "Hide Status";
        examForm.style.display = "none";
    }

});
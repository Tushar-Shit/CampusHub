import { db, auth } from "../js/firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

document.querySelector("body").style.display = "none";


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

    const role = userDoc.data().role;

    if (role !== "student") {
        alert("Access denied");
        window.location.href = "../index.html";
        return;
    }
    else {
        document.querySelector("body").style.display = "flex";
    }

    try {
        const q = queryUid(user.uid);
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement("div");

            div.style.border = "1px solid black";
            div.style.padding = "10px";
            div.style.margin = "10px";

            div.innerHTML = `
                    Semester: ${data.semester} <br>
                    <b>Status: ${data.status}</b>
                `;

            box.appendChild(div);
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
    const file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Select a file");
        return;
    }

    if (file.size > 1 * 1024 * 1024) {
        alert("File must be less than 1MB");
        return;
    }


    const user = auth.currentUser;
    if (!user) {
        alert("User not logged in");
        return;
    }

    const q = queryUid(user.uid);

    const snapshot = await getDocs(q);

    let alreadyApplied = false;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.semester == semester) {
            if (data.status === "Approved" || data.status === "Pending") {
                alert(`Status: ${data.status}`);
                alreadyApplied = true;
                break;
            }
        }
    }

    if (!alreadyApplied) {
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
    }
});




let agcvbh = JSON.parse(sessionStorage.getItem("data"));
const formName = document.querySelector("#fullName");
const formSemester = document.querySelector("#semester");
const formRadio = document.querySelector(`input[name='department'][value=${agcvbh.department}]`);
const formCollegeRoll = document.querySelector("#clgRoll");
const formUniRoll = document.querySelector("#uniRoll");
const formMobileNumber = document.querySelector("#mobileNumber");

formName.value = agcvbh.name;
formUniRoll.value = agcvbh.universityRoll;
formCollegeRoll.value = agcvbh.collegeRoll;
formMobileNumber.value = agcvbh.mobile;
formSemester.value = agcvbh.semester;
if (formRadio) {
    formRadio.checked = true;
}
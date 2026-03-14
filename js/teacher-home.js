import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { db, auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    getAuth,
    updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,

} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const pageLoader = document.getElementById("pageLoader");
pageLoader.style.display = "flex";
document.querySelector(".dashboard-container").style.display = "none";

let currentUser;
let currentData = {};
let person;
let editDetails = {};

const tname = document.querySelector("#teacher-name");
const designation = document.querySelector("#teacher-role");
const email = document.querySelector("#teacher-email");
const phNo = document.querySelector("#teacher-phone");
const dept = document.querySelector("#teacher-dept");
const rightHeadName = document.querySelector("#right-head-name");
const addTeacher = document.querySelector("#add-teacher");
const logoutBtn = document.querySelector("#logout");

const editBtn = document.querySelector("#edit-name-details");
const crossBtn = document.querySelector("#cross-btn");
const editPopup = document.querySelector("#edit-popup");
const formHeading = document.querySelector("#form-heading");
const editSaveBtn = document.querySelector("#edit-save");

let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editPassword = document.querySelector("#edit-password");

const depts = document.querySelectorAll(".course-card");

onAuthStateChanged(auth, async user => {
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

    if (role !== "teacher" && role !== "admin") {
        await signOut(auth);
        alert("Access denied");
        window.location.href = "../index.html";
    }

    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    onSnapshot(userRef, (docSnap) => {

        const data = docSnap.data();
        currentData = data;

        const shortName = document.querySelector("#name-short");
        shortName.innerText = "";
        let words = data.name.trim().split(" ");
        for (let word of words)
            shortName.innerText += word[0].toUpperCase();

        tname.innerText = "";
        tname.innerText = words.filter(w => w !== "").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
        rightHeadName.innerText = words[0].toUpperCase();
        designation.innerText = data.designation;
        email.innerText = data.email;
        phNo.innerText = data.mobile;
        dept.innerText = data.department;

        person = data.role;
        if (person.trim() !== "admin") {
            addTeacher.innerHTML = "";
            addTeacher.style.display = "none";
        }
        pageLoader.style.display = "none";
        document.querySelector(".dashboard-container").style.display = "flex";

    });
});

editBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;

    formHeading.innerText = "Update Your Profile";
    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");
    editPassword.parentElement.style.display = "none";
    editPassword.parentElement.innerHTML = "";

    editedName.value = currentData.name;
    editDesignation.value = currentData.designation;
    editEmail.value = currentData.email;
    editPhNo.value = currentData.mobile;
});

crossBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;
    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";
})

editSaveBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    editDetails = {}

    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";

    if (formHeading.innerText === "Update Your Profile") {

        if (editedName.value.trim() !== "") editDetails["name"] = editedName.value;
        if (editDesignation.value.trim() !== "") editDetails["designation"] = editDesignation.value;
        if (editEmail.value.trim() !== "" && editEmail.value.trim() !== currentData.email) {
            console.log("process start");
            changeEmail(editEmail.value.trim());
        }
        if (editPhNo.value.trim() !== "") editDetails["mobile"] = editPhNo.value;

        const editDept = document.querySelector("input[name='edit-dept']:checked");
        if (editDept === null) {
            editDetails["department"] = currentData.department;
        }
        else {
            editDetails["department"] = editDept.value;
        }

        try { await updateDoc(doc(db, "users", currentUser.uid), editDetails); }
        catch { console.log("error found to update db"); }
    }

    if (formHeading.innerText === "Create Teacher Account" && person.trim() === "admin") {
        document.querySelectorAll("input[name='edit-dept']").forEach(each => each.checked = false);

        if (editedName.value.trim() === "" ||
            editDesignation.value.trim() === "" ||
            editEmail.value.trim() === "" ||
            editPhNo.value.trim() === "" ||
            editPassword.value.trim() === ""
        )
            alert("please fill the form accrodingly.");
        else {
            editDetails["name"] = editedName.value;
            editDetails["designation"] = editDesignation.value;
            editDetails["email"] = editEmail.value;
            editDetails["mobile"] = editPhNo.value;
            editDetails["role"] = "teacher";

            const editDept = document.querySelector("input[name='edit-dept']:checked");
            if (editDept === null)
                editDetails["department"] = currentData.department;
            else
                editDetails["department"] = editDept.value;
        }

        const firebaseConfig = {
            apiKey: "AIzaSyCTX_Zr6z3FwJdEKxZOqNnhpmuRE-hd_Mk",
            authDomain: "exam-form-verify.firebaseapp.com",
            projectId: "exam-form-verify",
            storageBucket: "exam-form-verify.firebasestorage.app",
            messagingSenderId: "903182007047",
            appId: "1:903182007047:web:c457c94da81660e169a3a2"
        };

        const secondaryApp = initializeApp(firebaseConfig, "secondary");
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, editEmail.value, editPassword.value);

            await setDoc(doc(db, "users", userCred.user.uid), editDetails);
        }
        catch (error) { console.log("fail to add teacher", error); }
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../index.html";
    }
    catch (e) {
        alert("Failed to Logout");
    }
})

addTeacher.addEventListener("click", () => {

    formHeading.innerText = "Create Teacher Account";
    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");

    editedName.value = "";
    editDesignation.value = "";
    editEmail.value = "";
    editPhNo.value = "";
    editPassword.value = "";

})

depts.forEach(item => {
    item.addEventListener("click", function () {
        const key = this.innerText;
        localStorage.setItem("stream", key);
        window.location.href = "teacher-dept-page.html";
    })
});

async function changeEmail(newEmail) {

    const password = prompt("Enter your password to update your Email");

    const user = auth.currentUser;

    try {

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);

        await updateEmail(user, newEmail);

        await updateDoc(doc(db, "users", user.uid), {
            email: newEmail
        });

        alert("Email updated successfully");

    } catch (error) {

        alert("Must Have to Enter Your Password");

    }

};

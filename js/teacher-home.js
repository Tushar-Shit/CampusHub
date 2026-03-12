import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { db, auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut, getAuth
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    collection, onSnapshot,
    doc, updateDoc,
    query, where,
    getDoc, setDoc
}
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


let currentUser;
let currentData = {};



//selecting the fields where changes need
const tname = document.querySelector("#teacher-name");
const designation = document.querySelector("#teacher-role");
const email = document.querySelector("#teacher-email");
const phNo = document.querySelector("#teacher-phone");
const dept = document.querySelector("#teacher-dept");
const rightHeadName = document.querySelector("#right-head-name");


// profile edit logic
const editBtn = document.querySelector("#edit-name-details");
const crossBtn = document.querySelector("#cross-btn");
const editPopup = document.querySelector("#edit-popup");
const formHeading = document.querySelector("#form-heading")

const addTeacher = document.querySelector("#add-teacher");
const ureJaDiv = document.querySelector("#ure-ja");
//fields inside the popup form

//form values
let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editPassword = document.querySelector("#edit-password");

// let editDept = document.querySelector("input[name='edit-dept']:checked");
let person;
onAuthStateChanged(auth, async user => {

    currentUser = user;
    const userRef = doc(db, "users", user.uid);

    onSnapshot(userRef, (docSnap) => {

        const data = docSnap.data();


        currentData = data;

        // UI Update
        tname.innerText = data.name.trim();
        rightHeadName.innerText = data.name.toUpperCase();
        designation.innerText = data.designation;
        email.innerText = data.email;
        phNo.innerText = data.mobile;
        dept.innerText = data.department;
        person = data.role;
        if (person.trim() !== "admin") {
            addTeacher.innerHTML = "";
            addTeacher.style.display="none";
        }
    });
});



//profile edit popup show
editBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;
    formHeading.innerText = "Update Your Profile";
    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");


    // Fill popup fields
    editedName.value = currentData.name;
    editDesignation.value = currentData.designation;
    editEmail.value = currentData.email;
    editPhNo.value = currentData.phone;

})

//profile edit popup close
crossBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;
    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";
})


//save button logic
const editSaveBtn = document.querySelector("#edit-save");
let editDetails = {};

editSaveBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    editDetails = {}
    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";


    if (formHeading.innerText === "Update Your Profile") {

        if (editedName.value.trim() !== "") editDetails["name"] = editedName.value;
        if (editDesignation.value.trim() !== "") editDetails["designation"] = editDesignation.value;
        if (editEmail.value.trim() !== "") editDetails["email"] = editEmail.value;
        if (editPhNo.value.trim() !== "") editDetails["phone"] = editPhNo.value;


        const editDept = document.querySelector("input[name='edit-dept']:checked");
        if (editDept === null) {
            editDetails["department"] = currentData.department;
        }
        else {
            editDetails["department"] = editDept.value;
        }


        try {
            await updateDoc(doc(db, "users", currentUser.uid), editDetails);

            console.log("update Succesfully");
        }
        catch {
            console.log("error found to update db");
        }
    }
    if (formHeading.innerText === "Create Teacher Account" && person.trim() === "admin") {
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
            //have to take gender
            //only admin can add teacher no one else

            // editDetails["password"] = editPassword.value;
            const editDept = document.querySelector("input[name='edit-dept']:checked");
            if (editDept === null) {
                editDetails["department"] = currentData.department;
            }
            else {
                editDetails["department"] = editDept.value;
            }
        }

        // import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


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
        // const secondaryDb = getFirestore(secondaryApp);

        try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, editEmail.value, editPassword.value);
            // console.dir(userCred);
            await setDoc(doc(db, "users", userCred.user.uid), editDetails);
            console.log("Teacher Assigning successfully");
        } catch (error) {
            console.log("fail to add teacher", error);
        }


    }
    console.log(editDetails);
});

//logout logic
const logoutBtn = document.querySelector("#logout");
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../index.html";
    }
    catch (e) {
        alert("Failed to Logout");
    }
})

//adding new teacher
let newTeacherData = {};
addTeacher.addEventListener("click", () => {
    editedName.value = "";
    editDesignation.value = "";
    editEmail.value = "";
    editPhNo.value = "";
    editPassword.value = "";

    formHeading.innerText = "Create Teacher Account";
    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");

})














//depertment click logic
const depts = document.querySelectorAll(".course-card");
depts.forEach(item => {
    item.addEventListener("click", function () {
        const key = this.innerText;
        localStorage.setItem("stream", key);
        window.location.href = "teacher-dept-page.html";
        console.dir(depts);
    })
});

//right click off
// document.addEventListener("contextmenu", function (e) {
//     e.preventDefault();
// });

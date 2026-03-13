import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { db, auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut, getAuth, updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,

} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    collection, onSnapshot,
    doc, updateDoc,
    query, where,
    getDoc, setDoc
}
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


//Global variables
let currentUser;
let currentData = {};
let person;//admin, teacher, student
let editDetails = {};



//profile details sections
const tname = document.querySelector("#teacher-name");
const designation = document.querySelector("#teacher-role");
const email = document.querySelector("#teacher-email");
const phNo = document.querySelector("#teacher-phone");
const dept = document.querySelector("#teacher-dept");
const rightHeadName = document.querySelector("#right-head-name");
const addTeacher = document.querySelector("#add-teacher");
const logoutBtn = document.querySelector("#logout");

// profile edit popupcontainer
const editBtn = document.querySelector("#edit-name-details");
const crossBtn = document.querySelector("#cross-btn");
const editPopup = document.querySelector("#edit-popup");
const formHeading = document.querySelector("#form-heading");
const editSaveBtn = document.querySelector("#edit-save");

//profile edit form fields
let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editPassword = document.querySelector("#edit-password");

//course selection
const depts = document.querySelectorAll(".course-card");



//check authentication and show/hide details 
onAuthStateChanged(auth, async user => {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    onSnapshot(userRef, (docSnap) => {

        const data = docSnap.data();
        currentData = data;

        //short name in circle in the profile
        const shortName = document.querySelector("#name-short");
        shortName.innerText = "";
        let words = data.name.trim().split(" ");
        for (let word of words)
            shortName.innerText += word[0].toUpperCase();


        //filling the profile fields
        //making the user name's first letter of each word capital
        tname.innerText = "";
        tname.innerText = words.filter(w => w !== "").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
        rightHeadName.innerText = words[0].toUpperCase();
        designation.innerText = data.designation;
        email.innerText = data.email;
        phNo.innerText = data.mobile;
        dept.innerText = data.department;

        //hide add teacher button if user isn't admin
        person = data.role;
        if (person.trim() !== "admin") {
            addTeacher.innerHTML = "";
            addTeacher.style.display = "none";
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
    editPassword.parentElement.style.display = "none";
    editPassword.parentElement.innerHTML = "";

    // fill popup fields
    editedName.value = currentData.name;
    editDesignation.value = currentData.designation;
    editEmail.value = currentData.email;
    editPhNo.value = currentData.mobile;
    // if (currentData.department === "Bachelor Of Computer Application (BCA)") {
    //     document.getElementById("dept-bca").checked = true;
    // }
    // else if (currentData.department === "Bachelor Of Business Administration(BBA)") {
    //     document.getElementById("dept-bba").checked = true;
    // }
    // else if (currentData.department === "Bachelor Of Hospital Management(BHM)") {
    //     document.getElementById("dept-bhm").checked = true;
    // }
    // else if (currentData.department === "Bachelor Of Medical Laboratory Technology(BMLT)") {
    //     document.getElementById("dept-bmlt").checked = true;
    // }

});

//profile edit popup close
crossBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;
    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";
})


//save button logic
editSaveBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    editDetails = {}

    //hoding the popup
    editPopup.classList.remove("state-show");
    editPopup.classList.add("state-hide");
    editPopup.style.display = "none";

    //code for update profile
    if (formHeading.innerText === "Update Your Profile") {

        if (editedName.value.trim() !== "") editDetails["name"] = editedName.value;
        if (editDesignation.value.trim() !== "") editDetails["designation"] = editDesignation.value;
        if (editEmail.value.trim() !== "" && editEmail.value.trim() !== currentData.email) {
            console.log("process start");
            changeEmail(editEmail.value.trim());
        }
        // else alert("email not change");
        if (editPhNo.value.trim() !== "") editDetails["mobile"] = editPhNo.value;


        const editDept = document.querySelector("input[name='edit-dept']:checked");
        if (editDept === null) {
            editDetails["department"] = currentData.department;
        }
        else {
            editDetails["department"] = editDept.value;
            // editDept.checked = false;
        }


        try { await updateDoc(doc(db, "users", currentUser.uid), editDetails); }
        catch { console.log("error found to update db"); }
    }

    //code for add teacher
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
            //have to take gender

            // editDetails["password"] = editPassword.value;
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
        //creating secondary authentication for new teacher's data to be login
        const secondaryApp = initializeApp(firebaseConfig, "secondary");
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, editEmail.value, editPassword.value);

            await setDoc(doc(db, "users", userCred.user.uid), editDetails);
        }
        catch (error) { console.log("fail to add teacher", error); }
    }
});

//logout logic
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
addTeacher.addEventListener("click", () => {

    formHeading.innerText = "Create Teacher Account";
    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");

    //keep the fields empty
    editedName.value = "";
    editDesignation.value = "";
    editEmail.value = "";
    editPhNo.value = "";
    editPassword.value = "";

})


//depertment click logic
depts.forEach(item => {
    item.addEventListener("click", function () {
        const key = this.innerText;
        localStorage.setItem("stream", key);
        window.location.href = "teacher-dept-page.html";
    })
});


//right click off
// document.addEventListener("contextmenu", function (e) {
//     e.preventDefault();
// });












async function changeEmail(newEmail) {

    // const newEmail = document.getElementById("newEmail").value;
    const password = prompt("Enter your password to update your Email");

    const user = auth.currentUser;

    try {

        // 1️⃣ create credential
        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        // 2️⃣ reauthenticate
        await reauthenticateWithCredential(user, credential);

        // 3️⃣ update email (no verification)
        await updateEmail(user, newEmail);

        // 4️⃣ update firestore
        await updateDoc(doc(db, "users", user.uid), {
            email: newEmail
        });

        alert("Email updated successfully");

    } catch (error) {

        console.log(error);
        alert(error.message);

    }

};
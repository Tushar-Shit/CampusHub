import { auth, db } from "../js/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const main = document.getElementById("main");
const pageLoader = document.getElementById("pageLoader");
const userName = document.getElementById("userName");
const heading = document.getElementById("heading");
const userEmail = document.getElementById("userEmail");
const mobile = document.getElementById("mobile");
const gender = document.getElementById("gender");
const department = document.getElementById("department");
const collegeRoll = document.getElementById("collegeRoll");
const semester = document.getElementById("semester");
const universityRoll = document.getElementById("universityRoll");
const session = document.getElementById("session");


pageLoader.style.display = "flex";

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

    if (role !== "student") {
        alert("Access denied");
        window.location.href = "../index.html";
    }

    try {
        const data = userDoc.data();
        sessionStorage.setItem("data", JSON.stringify(data));

        let nameArr = (data.name).trim().split(" ");

        userLogo.innerText = "";
        for (let word of nameArr) {
            userLogo.innerText += word[0].toUpperCase();
        }

        userName.innerText = `Name: ${data.name}`;
        heading.innerText = `Welcome ${data.name}`;
        userEmail.innerText = `Email: ${data.email}`;
        mobile.innerText = `Mobile No: ${data.mobile}`;
        gender.innerText = `Gender: ${data.gender}`;
        department.innerText = `Department: ${data.department}`;
        collegeRoll.innerText = `College Roll: ${data.collegeRoll}`;
        semester.innerText = `Semester: ${data.semester}`;
        universityRoll.innerText = `University Roll: ${data.universityRoll}`;
        session.innerText = `Session: ${data.admissionYear} - ${parseInt(data.admissionYear) + 4}`;


        pageLoader.style.display = "none";
        main.style.display = "flex";
    } catch (err) {
        console.log(err);
    }
});

document.querySelectorAll(".saveIcon").forEach(icon => {
    icon.addEventListener("click", async function () {

        const container = this.closest("div");
        const span = container.querySelector("span");
        const input = container.querySelector("input");
        const edit = container.querySelector(".editIcon");
        const cancel = container.querySelector(".cancelIcon");
        const save = container.querySelector(".saveIcon");
        const fieldName = span.id;
        const newValue = input.value.trim();

        function editBoxClose() {
            span.style.display = "flex";
            edit.style.display = "flex";
            input.style.display = "none";
            cancel.style.display = "none";
            save.style.display = "none";
            input.value = "";
        };

        if (!newValue) {
            alert("Enter Details to update");
            return;
        }

        let mNo = /^\d{10}$/;
        let uNo = /^\d{11}$/;
        let sNo = /^(I|II|III|IV|V|VI|VII|VIII)$/;

        if (fieldName === "mobile") {
            if (!mNo.test(newValue)) {
                alert("Failed to change");
                editBoxClose();
                return;
            }
        }
        else if (fieldName === "universityRoll") {
            if (!uNo.test(newValue)) {
                alert("Failed to change");
                editBoxClose();
                return;
            }
        }
        else if (fieldName === "semester") {
            if (!sNo.test(newValue)) {
                alert("Failed to change");
                editBoxClose();
                return;
            }
        }

        try {
            const user = auth.currentUser;

            await updateDoc(doc(db, "users", user.uid), {
                [fieldName]: newValue
            });

            let spanTextHeading;
            if (fieldName === "mobile") {
                spanTextHeading = "Mobile No:"
            }
            else if (fieldName === "universityRoll") {
                spanTextHeading = "University Roll:";
            }
            else if (fieldName === "semester") {
                spanTextHeading = "Semester:";
            }
            span.innerText = `${spanTextHeading} ${newValue}`;
            editBoxClose();
            alert("Update Successful");
        } catch (error) {
            alert("Update failed");
        }
    });
});


window.logout = async () => {
    try {
        await signOut(auth);
        sessionStorage.clear();
        window.location.href = "../index.html";
    } catch (error) {
        alert("Failed to Logout");
    }
};
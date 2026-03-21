import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { db, auth, rtdb } from "./firebase.js";
import { ref, set, getDatabase, remove } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
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
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";




const pageLoader = document.getElementById("pageLoader");
pageLoader.style.display = "flex";
document.querySelector(".dashboard-container").style.display = "none";

const tname = document.querySelector("#teacher-name");
const designation = document.querySelector("#teacher-role");
const email = document.querySelector("#teacher-email");
const phNo = document.querySelector("#teacher-phone");
const dept = document.querySelector("#teacher-dept");
const rightHeadName = document.querySelector("#right-head-name");
const addTeacher = document.querySelector("#add-teacher");
const semUpgradationBtn = document.querySelector("#sem-up");
const logoutBtn = document.querySelector("#logout");
const editBtn = document.querySelector("#edit-name-details");
const crossBtn = document.querySelector("#cross-btn");
const editPopup = document.querySelector("#edit-popup");
const formHeading = document.querySelector("#form-heading");
const editSaveBtn = document.querySelector("#edit-save");
const depts = document.querySelectorAll(".course-card");

let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editPassword = document.querySelector("#edit-password");
let currentUser, person, currentData = {}, editDetails = {};


onAuthStateChanged(auth, async user => {
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
            semUpgradationBtn.parentElement.parentElement.innerHTML = "";
            semUpgradationBtn.parentElement.parentElement.style.display = "none";
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
        ) {
            alert("please fill the form accrodingly. try again");
            return;
        }
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
            alert("Click OK to start assigning teachers. This may take up to 30 seconds. Please do not close or refresh the page.");
            pageLoader.style.display = "flex";
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, editEmail.value, editPassword.value);
            await setDoc(doc(db, "users", userCred.user.uid), editDetails);

            const querySnapshot = await getDocs(collection(db, "users"));

            querySnapshot.forEach((doc) => {
                const usersData = doc.data();
                if (usersData.role === "admin" || usersData.role === "teacher") {
                    addUser(doc.id, usersData.name, usersData.role);
                }
            });
        }
        catch (error) {
            console.log("fail to add teacher", error);
            pageLoader.style.display = "none";
        }
    }
});

async function addUser(uid, name, role) {
    try {
        await set(ref(rtdb, "users/" + uid), {
            name: name,
            role: role
        });

        console.log("✅ User added successfully");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
    pageLoader.style.display = "none";
    alert("Teacher has been added successfully.");
}

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../index.html";
    } catch (e) {
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

const profile = document.querySelector("#name-short");
const detailsContainer = document.querySelector("#detailsContainer")
const media = window.matchMedia("(max-width:768px)");
function handleScreen(e) {
    if (!e.matches) {
        return;
    }
    profile.addEventListener("click", () => {
        detailsContainer.classList.toggle("blank");
    })
}

handleScreen(media);
media.addEventListener("change", handleScreen);

const featureBtn = document.querySelectorAll(".ex-fea-btn");
const back = document.querySelector("#back");
const featureCrossButton = document.querySelectorAll("#fea-cross-btn");
const proceedBtn = document.querySelector("#notice-confirm");
const okayBtn = document.querySelector("#notice-confirm1");
const firstHeading = document.querySelector("#refgs");
const headBar = document.querySelector("#headBar");
const firstParagraph = document.querySelector("#notice-txt");
const secondInterface = document.querySelector("#fore1");
const thirdInterface = document.querySelector("#lst_con");
const semShow = document.querySelector("#tsgsvfd");
const yesBtn = document.querySelector("#yes");
const message_succ = document.querySelector("#suc-mess");
const checkboxes = document.querySelectorAll(".checkbox-block input");
let checkedValues = [];
let showCase = [];

const semesterMap = {
    "I": "II",
    "II": "III",
    "III": "IV",
    "IV": "V",
    "V": "VI",
    "VI": "VII",
    "VII": "VIII"
};

// show / hide
const toggle = (el, show) => {
    el.classList.toggle("state-show", show);
    el.classList.toggle("state-hide", !show);
};

// get checked checkboxes
const getChecked = () => [...checkboxes].filter(cb => cb.checked);

// reset popup
const resetUI = () => {
    toggle(back, false);
    toggle(firstHeading, true);
    toggle(firstParagraph, true);
    toggle(secondInterface, false);
    toggle(thirdInterface, false);
    toggle(okayBtn, false);
    toggle(proceedBtn, true);
    toggle(message_succ, false);
    headBar.innerText = "Alert: Semester upgradation";

    checkboxes.forEach(cb => cb.checked = false);
};

//checkbox logic
checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        toggle(okayBtn, getChecked().length > 0);
    });
});


featureBtn.forEach(btn => {
    btn.addEventListener("click", e => {
        if (e.target.id === "sem-up" && person.trim() === "admin") {
            toggle(back, true);
            document.body.style.overflow = "hidden";
        }
    });
});

//close button logic
featureCrossButton.forEach(btn => {
    btn.addEventListener("click", () => {
        document.body.style.overflow = "auto";
        resetUI();
    });
});

//proceed button
proceedBtn.addEventListener("click", () => {
    // toggle(firstHeading, false);
    toggle(firstParagraph, false);
    toggle(secondInterface, true);
    toggle(proceedBtn, false);
    headBar.innerText = "Select the Semesters";
});

//okay button
okayBtn.addEventListener("click", () => {
    const selected = getChecked();
    checkedValues = selected.map(cb => cb.value);
    showCase = selected.map(cb => cb.parentElement.innerText);
    semShow.innerHTML = showCase.map(t => `<b>${t}</b>`).join(", ");
    toggle(thirdInterface, true);
    toggle(secondInterface, false);
    toggle(okayBtn, false);
    headBar.innerText = "Last Time Confirmation";
});

//yes button main action
yesBtn.addEventListener("click", async () => {
    headBar.innerText = "";

    pageLoader.style.display = "flex";

    await semesterUpgrade(checkedValues);
    toggle(message_succ, true);
    toggle(thirdInterface, false);

    pageLoader.style.display = "none";
});

//update semester in DB
async function semesterUpgrade(checkedValues) {

    const q = query(
        collection(db, "users"),
        where("semester", "in", checkedValues)
    );

    const snap = await getDocs(q);

    const databasess = getDatabase();
    const departments = ["BCA", "BBA", "BHM", "BMLT"];

    try {
        for (let sem of checkedValues) {
            for (let dept of departments) {
                const semRef = ref(databasess, `attendance/${dept}/${sem}`);
                await remove(semRef);
                console.log(`✅ ${dept} ${sem} deleted`);
            }
        }
        console.log("Selected semesters deleted successfully");
    } catch (error) {
        console.error("Error deleting attendance:");
    }

    for (const user of snap.docs) {
        const semester = user.data().semester;

        if (semester === "VIII") {
            await updateDoc(doc(db, "users", user.id), {
                semester: null,
                status: "Graduated"
            });
        } else {
            await updateDoc(doc(db, "users", user.id), {
                semester: semesterMap[semester]
            });
        }
    }
}
const removeDuplicate = document.querySelector("#rvm-dp");
removeDuplicate.addEventListener("click", () => {
    alert("Work in progress");
})

const attendance = document.querySelector("#attendance");
attendance.addEventListener("click", () => {
    window.location.href = "attendance.html";
});
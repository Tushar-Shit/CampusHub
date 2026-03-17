import { auth, db } from "../js/firebase.js";

import {
    onAuthStateChanged,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser,
    updateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const cachedData = sessionStorage.getItem("data");
const main = document.getElementById("main");
const pageLoader = document.getElementById("pageLoader");
const userName = document.getElementById("userName");
const heading = document.getElementById("heading");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const gender = document.getElementById("gender");
const department = document.getElementById("department");
const collegeRoll = document.getElementById("collegeRoll");
const semester = document.getElementById("semester");
const session = document.getElementById("session");
const verifyContainer = document.getElementById("verifyContainer");
const verifyForm = document.getElementById("verifyForm");
const otpInput = document.getElementById("otpInput");
const passwordInput = document.getElementById("passwordInput");
const verifyError = document.getElementById("verifyError");
const form = document.getElementById("changePassForm");
const currentPass = document.getElementById("currentPass");
const newPass = document.getElementById("newPass");
const confirmPass = document.getElementById("confirmPass");
const passError = document.getElementById("passError");
const changePassContainer = document.getElementById("changePassContainer");
const closePass = document.getElementById("closePass");
const togglePass = document.querySelectorAll(".togglePass");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const universityRollUpdatePossiable = document.getElementById("universityRollUpdatePossiable");
let userDataGlobal;

let pendingEmail = "";
let otpData = null;

pageLoader.style.display = "flex";

if (cachedData) {
    const userData = JSON.parse(cachedData);
    userDataShow(userData);
}


onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    const userRef = doc(db, "users", user.uid);
    let deleting = false;

    const unsubscribe = onSnapshot(userRef, async (userDoc) => {

        if (!userDoc.exists()) {
            redirectToIndex();
            return;
        }

        userDataGlobal = userDoc.data();

        if (userDataGlobal.status === "Deleted" && !deleting) {
            deleting = true;
            unsubscribe();
            const password = localStorage.getItem("Password");
            await deleteAccount(password);
            return;
        }

        if (userDataGlobal.role !== "student") {
            redirectToIndex();
            return;
        }

        userDataShow(userDataGlobal);
    });
});


document.addEventListener("click", async function (e) {

    const icon = e.target.closest(".saveIcon");
    if (!icon) return;

    pageLoader.style.display = "flex";

    const { span, input, edit: editBtn, cancel, save } = getElements(icon);


    const fieldName = span.id;
    const newValue = input.value.trim();

    function editBoxClose() {
        span.style.display = "flex";
        editBtn.style.display = "flex";
        input.style.display = "none";
        cancel.style.display = "none";
        save.style.display = "none";
        input.value = "";
        pageLoader.style.display = "none";
    }

    if (!newValue) {
        alert("Enter Details to update");
        pageLoader.style.display = "none";
        return;
    }

    let mNo = /^\d{10}$/;
    let uNo = /^\d{11}$/;
    let eNo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    else if (fieldName === "email") {
        if (!eNo.test(newValue)) {
            alert("Invalid Email Address");
            editBoxClose();
            return;
        }
    }

    try {
        const user = auth.currentUser;

        if (fieldName === "email") {
            if (newValue === auth.currentUser.email) {
                alert("This email is already your current email");
                pageLoader.style.display = "none";
                editBoxClose();
                return;
            }

            const name = userDataGlobal.name;
            await sendOTP(name, newValue);
            editBoxClose();
            return;
        }

        await updateDoc(doc(db, "users", user.uid), {
            [fieldName]: newValue
        });

        editBoxClose();
        alert("Update Successful");
        pageLoader.style.display = "none";

    } catch (error) {
        alert("Update failed");
    }

});

window.logout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("Password");
        sessionStorage.clear();
        window.location.href = "../index.html";
    } catch (error) {
        alert("Failed to Logout");
    }
};

async function deleteAccount(password) {
    const user = auth.currentUser;

    try {

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);

        sessionStorage.clear();
        localStorage.removeItem("Password");

        redirectToIndex();
    } catch (error) {
        console.log(error);
    }
}

function redirectToIndex() {
    alert("Access denied");
    window.location.href = "../index.html";
}

function userDataShow(userData) {
    try {
        sessionStorage.setItem("data", JSON.stringify(userData));

        let nameArr = (userData.name).trim().split(" ");

        userLogo.innerText = "";
        for (let word of nameArr) {
            userLogo.innerText += word[0].toUpperCase();
        }

        userName.innerHTML = `<span class="addColor">Name:</span> ${userData.name}`;
        heading.innerHTML = `Welcome ${userData.name}`;
        email.innerHTML = `<span class="addColor">Email:</span> ${userData.email}`;
        mobile.innerHTML = `<span class="addColor">Mobile No:</span> ${userData.mobile}`;
        gender.innerHTML = `<span class="addColor">Gender:</span> ${userData.gender}`;
        department.innerHTML = `<span class="addColor">Department:</span> ${userData.department}`;
        collegeRoll.innerHTML = `<span class="addColor">College Roll:</span> ${userData.collegeRoll}`;
        semester.innerHTML = `<span class="addColor">Semester:</span> ${userData.semester}`;
        session.innerHTML = `<span class="addColor">Session:</span> ${userData.admissionYear} - ${parseInt(userData.admissionYear) + 4}`;

        if (userData.universityRoll === "") {
            universityRollUpdatePossiable.innerHTML = `<span id="universityRoll" class="addColor">University Roll:</span>${userData.universityRoll}</span>

                    <input type="tel" placeholder="Enter University Roll..." class="editData" maxlength="11">

                    <svg class="editIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>

                    <svg class="cancelIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>

                    <svg class="saveIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>`
        } else {
            universityRollUpdatePossiable.innerHTML = `<span id="universityRoll">
                                                            <span class="addColor">University Roll:</span>
                                                            <span>${userData.universityRoll}</span>
                                                        </span>`;
        }

        pageLoader.style.display = "none";
        main.style.display = "flex";
    } catch (err) {
        console.log(err);
    }
};

async function sendOTP(name, email) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expire = Date.now() + 5 * 60 * 1000;
    const oldEmail = userDataGlobal.email;

    const emailSubject = "One Time Password (OTP) for CampusHub Email Update";
    const bodyInfo = `We received a request to change the email address associated with your CampusHub account (${oldEmail})`;

    await setDoc(doc(db, "otp", email), {
        otp: otp,
        expire: expire,
        attempts: 0
    });

    await fetch(
        "https://script.google.com/macros/s/AKfycbxNEPnp2T93gUH72zEVXXgNeNHnClZfLL1fUFU6ZryP59rKqzPiavFC9a4L1-NGSYk/exec",
        {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                emailSubject,
                bodyInfo,
                email,
                otp
            })
        }
    );
    await verifyOTP(email);
}

async function verifyOTP(newEmail) {
    const ref = doc(db, "otp", newEmail);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("OTP not found");
        return;
    }

    const data = snap.data();
    openVerifyModal(newEmail, data);
    pageLoader.style.display = "none";
}

function openVerifyModal(email, data) {
    pendingEmail = email;
    otpData = data;
    verifyContainer.style.display = "flex";
}

verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const OTP = otpInput.value.trim();
    const password = passwordInput.value.trim();

    if (!OTP || !password) {
        verifyError.innerText = "All fields required";
        return;
    }

    if (Date.now() > otpData.expire) {
        verifyError.innerText = "OTP expired";
        return;
    }

    if (Number(OTP) !== otpData.otp) {
        verifyError.innerText = "Invalid OTP";
        return;
    }

    try {

        const user = auth.currentUser;

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);

        await updateEmail(user, pendingEmail);

        await updateDoc(doc(db, "users", user.uid), {
            email: pendingEmail
        });

        verifyError.innerText = "Email updated successfully ✔";

        await deleteDoc(doc(db, "otp", pendingEmail));

        setTimeout(() => {
            location.reload();
        }, 1500);

    }
    catch (error) {
        if (error.code === "auth/wrong-password") {
            verifyError.innerText = "Incorrect password";
        }
        else if (error.code === "auth/email-already-in-use") {
            verifyError.innerText = "This email is already in use";
            await deleteDoc(doc(db, "otp", pendingEmail));
        }
        else {
            verifyError.innerText = "Something went wrong. Try again.";
            await deleteDoc(doc(db, "otp", pendingEmail));
        }
    }
});

closeVerify.onclick = () => {
    verifyContainer.style.display = "none";
    verifyForm.reset();
    verifyError.innerText = "";
};

changePasswordBtn.onclick = () => {
    changePassContainer.style.display = "flex";
}

closePass.onclick = () => {
    changePassContainer.style.display = "none";
    form.reset();
    passError.innerText = "";
};

togglePass.forEach(icon => {
    icon.addEventListener("click", () => {
        const input = document.getElementById(icon.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            icon.innerText = "🙈";
        }
        else {
            input.type = "password";
            icon.innerText = "👁";
        }
    });

});

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    passError.innerText = "";

    const current = currentPass.value.trim();
    const newPassword = newPass.value.trim();
    const confirm = confirmPass.value.trim();

    if (!current || !newPassword || !confirm) {
        passError.innerText = "All fields are required";
        return;
    }

    if (newPassword.length < 6) {
        passError.innerText = "Password must be at least 6 characters";
        return;
    }

    if (newPassword !== confirm) {
        passError.innerText = "Passwords do not match";
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
            user.email,
            current
        );

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        passError.style.color = "#00ff88";
        passError.innerText = "Password updated successfully ✔";

        form.reset();
    } catch (error) {
        passError.style.color = "white";
        if (error.code === "auth/wrong-password") {
            passError.innerText = "Incorrect current password";
        }
        else {
            passError.innerText = "Password update failed";
        }
    }
});
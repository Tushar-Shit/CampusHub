import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const showPassword = document.getElementById("ShowPassword");
const forgotPass = document.getElementById("forgotPass");
const pageLoader = document.getElementById("pageLoader");
const signupForm = document.getElementById("signupForm");

onAuthStateChanged(auth, async user => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const role = snap.data().role;

    if (role === "teacher" || role === "admin")
        window.location.href = "./teacher/teacher-home.html";
    else
        window.location.href = "./student/Student-Home.html";
});

signupForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (sessionStorage.getItem("slipVerified") !== "true") {
        alert("Verify payment receipt first");
        location.reload(true);
        return;
    }

    pageLoader.style.display = "flex";

    const name = document.getElementById("name").value.trim();
    const gender = document.getElementById("gender").value;
    const dept = document.querySelector('input[name="dept"]:checked')?.value;
    const semester = document.getElementById("semester").value;
    const collRoll = document.getElementById("clgRoll").value;
    const universityRoll = document.getElementById("universityRoll").value;
    const admissionYear = document.getElementById("admissionYear").value;
    const mobile = document.getElementById("mobile").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const otpEmail = document.getElementById("otp-email");

    let deptCode = dept.substring(0, 2).toUpperCase();
    let yearCode = admissionYear.slice(-2);
    let rollCode = collRoll.padStart(2, '0');

    let clgRoll = `${deptCode}/${yearCode}/${rollCode}`;

    if (!semester) {
        alert("Select semester");
        pageLoader.style.display = "none";
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        pageLoader.style.display = "none";
        return;
    }

    sessionStorage.setItem("signupData", JSON.stringify({
        name,
        gender,
        dept,
        semester,
        clgRoll,
        universityRoll,
        admissionYear,
        mobile,
        email,
        password
    }));

    localStorage.setItem("Password", password.trim());


    sendOTP(name, email);

    otpEmail.innerHTML = email;
    signupContainer.style.display = "none";
    otpVerifyContainer.style.display = "flex";
    startTimer();
});

window.verifyOTP = async function () {
    pageLoader.style.display = "flex";

    const signupData = JSON.parse(sessionStorage.getItem("signupData"));

    const {
        name,
        gender,
        dept,
        semester,
        clgRoll,
        universityRoll,
        admissionYear,
        mobile,
        email,
        password
    } = signupData;

    const inputOTP = document.getElementById("otpInput").value;
    const ref = doc(db, "otp", email);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("OTP not found");
        pageLoader.style.display = "none";
        return;
    }
    const data = snap.data();

    if (Date.now() > data.expire) {
        alert("OTP expired");
        await deleteDoc(ref);
        pageLoader.style.display = "none";
        return;
    }

    if (data.attempts >= 3) {
        alert("You have exceeded the OTP limit. Please sign up again.");

        await deleteDoc(ref);
        pageLoader.style.display = "none";
        otpVerifyContainer.style.display = "none";
        signupContainer.style.display = "flex";
        return;
    }


    if (Number(inputOTP) === data.otp) {
        await deleteDoc(ref);

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", userCred.user.uid), {
                name,
                role: aoihgf,
                gender,
                department: dept,
                collegeRoll: clgRoll,
                semester,
                universityRoll,
                admissionYear,
                mobile,
                email,
                createdAt: new Date(),
                status: "Active"
            });

            alert("OTP Verify Successfull");
            sessionStorage.removeItem("slipVerified");
            signupContainer.style.display = "none";

            setTimeout(() => {
                window.location.href = "./student/Student-Home.html";
            }, 4500);
        }
        catch (err) {
            alert("An account with this email already exists. Please login.");
            emailInput.value = email;
            pageLoader.style.display = "none";
            sessionStorage.removeItem("slipVerified");
            otpVerifyContainer.style.display = "none";
            studentLoginPopup();
        }
    }
    else {
        await updateDoc(ref, {
            attempts: data.attempts + 1
        });
        alert("Wrong OTP");
        pageLoader.style.display = "none";
    }
};

loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    pageLoader.style.display = "flex";

    try {
        const userCred = await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value.trim()
        );

        const userDoc = await getDoc(doc(db, "users", userCred.user.uid));

        const data = userDoc.data();

        if (!loginType.includes(data.role)) {
            await signOut(auth);
            window.location.href = "./index.html";
            return;
        }
        else {
            if (data.role === "teacher" || data.role === "admin") {
                window.location.href = "./teacher/teacher-home.html";
            }

            else {
                localStorage.setItem("Password", passwordInput.value.trim());
                window.location.href = "./student/Student-Home.html";
            }
        }
    } catch (error) {
        pageLoader.style.display = "none";

        if (error.code === "auth/wrong-password") {
            alert("Wrong Password");
        }
        else if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
            alert("User not found");
        }
        else {
            alert("Login Failed");
        }
    }
});

forgotPass.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
        alert("Enter email first");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Reset email sent\nCheck spam folder in Email");
    } catch (error) {
        alert(error.message);
    }
});

showPassword.addEventListener("change", () => {
    passwordInput.type =
        showPassword.checked ? "text" : "password";
});

function startTimer() {
    clearInterval(countdown);

    timeLeft = 30;
    resendBtn.disabled = true;

    countdown = setInterval(() => {
        timeLeft--;

        timerText.innerText = `Resend OTP in ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerText.innerText = "You can resend OTP now";
            resendBtn.disabled = false;
        }
    }, 1000);
}

resendBtn.addEventListener("click", () => {
    const signupData = JSON.parse(sessionStorage.getItem("signupData"));
    sendOTP(signupData.name, signupData.email);

    timeLeft = 30;
    clearInterval(countdown);
    startTimer();
});

async function sendOTP(name, email) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expire = Date.now() + 5 * 60 * 1000;
    const emailSubject = "One Time Password (OTP) for CampusHub Account Signup";
    const bodyInfo = "Welcome to CampusHub! Please use the OTP below to verify your email address and complete your signup.";

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
                email: email,
                otp
            })
        }
    );
    pageLoader.style.display = "none";
}
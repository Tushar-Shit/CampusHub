import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateEmail,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let userDataGlobal;
let unsubscribeExam = null;
const cachedData = sessionStorage.getItem("data");
const logout = document.getElementById("logout");
const avatar = document.getElementById("avatar");
const fullName = document.getElementById("fullName");
const universityRoll = document.getElementById("universityRoll");
const collegeRoll = document.getElementById("collegeRoll");
const department = document.getElementById("department");
const semester = document.getElementById("semester");
const session = document.getElementById("session");
const gender = document.getElementById("gender");
const mobileNo = document.getElementById("mobileNo");
const UserEmail = document.getElementById("UserEmail");
const ChangePasswordButton = document.getElementById("ChangePasswordButton");
const togglePass = document.querySelectorAll(".togglePass");
const passError = document.getElementById("passError");
const changePassForm = document.getElementById("changePassForm");


const exmForm = document.getElementById("exmForm");
const formName = document.getElementById("formName");
const formClgRoll = document.getElementById("formClgRoll");
const formUniRoll = document.getElementById("formUniRoll");
const formSemester = document.getElementById("formSemester");
const formMobile = document.getElementById("formMobile");
const deptRadios = document.querySelectorAll('input[name="dept"]');
const feesStructure = document.getElementById("feesStructure");
const studentModal = document.getElementById("studentModal");
const crossBtn = document.getElementById("crossBtn");
const recentUpdates = document.getElementById("recent-updates");
const studentForm = document.getElementById("studentForm");
const pageLoader = document.getElementById("pageLoader");

const forgotPass = document.getElementById("forgotPass");
const changePassContainer = document.getElementById("changePassContainer");
const currentPass = document.getElementById("currentPass");
const newPass = document.getElementById("newPass");
const confirmPass = document.getElementById("confirmPass");


const changeEmailContainer = document.getElementById("changeEmailContainer");
const emailChange = document.getElementById("emailChange");
const otpVerify = document.getElementById("otpVerify");
const editFieldMessage = document.getElementById("editFieldMessage");
let newEmailGlobal;
const closeButton = document.querySelectorAll(".close-button")
const emailChangeContainer = document.getElementById("emailChangeContainer");
const profileEdit = document.getElementById("profileEdit");
const profileEditHeading = document.getElementById("profileEditHeading");
const updateProfileform = document.getElementById("updateProfileform");
const updateProfileInput = document.getElementById("updateProfileInput");
const uniuUpdate = document.getElementById("uniuUpdate");

pageLoader.style.display = "flex";

if (cachedData) {
    const userData = JSON.parse(cachedData);
    profileContainerData(userData);
    formDataInput(userData);
}

function redirectToIndex() {
    alert("Access denied");
    window.location.href = "../index.html";
}

onAuthStateChanged(auth, async user => {
    if (!user) {
        location.href = "../index.html";
        return;
    }

    if (unsubscribeExam) unsubscribeExam();

    unsubscribeExam = getExamFormData(user);

    const userRef = doc(db, "users", user.uid);
    let deleting = false;

    const unsubscribe = onSnapshot(userRef, async (userDoc) => {
        if (!userDoc.exists()) {
            redirectToIndex();
            return;
        }

        userDataGlobal = userDoc.data();
        sessionStorage.setItem("data", JSON.stringify(userDataGlobal));

        //Account Deelete logic
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

        formDataInput(userDataGlobal);
        profileContainerData(userDataGlobal);
        uniupdatepossiable(userDataGlobal);
    });
});

async function logoutUser() {
    try {
        sessionStorage.clear();
        localStorage.clear();
        await signOut(auth);
    }
    catch {
        alert("Failed to Logout");
    }
}

logout.addEventListener("click", () => {
    logoutUser();
});

function profileContainerData(userData) {
    avatar.innerText = "";

    let nameArr = (userData.name).trim().split(" ");
    for (let word of nameArr) {
        avatar.innerText += word[0].toUpperCase();
    }

    fullName.innerText = userData.name;
    universityRoll.innerText = userData.universityRoll;
    collegeRoll.innerText = userData.collegeRoll;
    department.innerText = userData.department;
    semester.innerText = userData.semester;
    session.innerText = `${userData.admissionYear} - ${parseInt(userData.admissionYear) + 4}`;
    gender.innerText = userData.gender;
    mobileNo.innerText = userData.mobile;
    UserEmail.innerText = userData.email;

    pageLoader.style.display = "none";
}

exmForm.addEventListener("click", () => {
    studentModal.style.display = "flex";
    document.body.style.overflow = "hidden";
});
crossBtn.addEventListener("click", () => {
    studentModal.style.display = "none";
    document.body.style.overflow = "auto";
});
feesStructure.addEventListener("click", () => {
    alert("Work in Progress...")
});

function formDataInput(userData) {
    formName.value = userData.name;
    formClgRoll.value = userData.collegeRoll;
    formUniRoll.value = userData.universityRoll;
    formSemester.value = userData.semester;
    formMobile.value = userData.mobile;
    deptRadios.forEach(radio => {
        if (radio.value === userData.department) {
            radio.checked = true;
        }
    });
}

function getExamFormData(user) {
    const q = query(
        collection(db, "examApplications"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            return;
        }

        recentUpdates.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();
            recentUpdatesFields(data);
        });
    });
};

function recentUpdatesFields(data) {
    let statusClass;
    if (data.status === "Approved") {
        statusClass = "status-approved";
    }
    else if (data.status === "Rejected") {
        statusClass = "status-rejected";
    }
    else {
        statusClass = "status-pending";
    }

    const card = document.createElement("div");
    card.classList.add("activity-card");
    const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date();

    card.innerHTML =
        `
        <div class="status-row">
            <div>
                <span style="display: block; font-weight: 600;">Semester ${data.semester} Exam Form</span>
                <small style="color: #9aa99b;">Last applied: ${createdAt.toLocaleString()}</small>
            </div>
            <span class="status-pill ${statusClass}">${data.status}</span>
        </div>
    `;

    recentUpdates.appendChild(card);
};

studentForm.addEventListener("submit", async (e) => {
    pageLoader.style.display = "flex";
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("User not logged in");
        pageLoader.style.display = "none";
        return;
    }

    const name = formName.value.trim();
    const clgRoll = formClgRoll.value.trim();
    const uniRoll = formUniRoll.value.trim();
    const semesterValue = formSemester.value;
    const mobile = formMobile.value.trim();

    const dept = document.querySelector('input[name="dept"]:checked')?.value;

    try {
        const q = query(
            collection(db, "examApplications"),
            where("uid", "==", user.uid),
            where("semester", "==", semesterValue)
        );

        const snapshot = await getDocs(q);

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            if (data.status === "Approved" || data.status === "Pending") {
                alert(`Application already exists. Status: ${data.status}`);
                pageLoader.style.display = "none";
                return;
            }
        }

        await addDoc(collection(db, "examApplications"), {
            uid: user.uid,
            fullName: name,
            department: dept,
            semester: semesterValue,
            clgRoll,
            uniRoll,
            mobile,
            status: "Pending",
            createdAt: serverTimestamp()
        });

        alert("Application Submitted!");
        pageLoader.style.display = "none";
        studentModal.style.display = "none";
    } catch (err) {
        alert("Something went wrong");
        pageLoader.style.display = "none";
    }
});


//passrest code

ChangePasswordButton.onclick = () => {
    changePassContainer.style.display = "flex";
    document.body.style.overflow = "hidden";
}

closeButton.forEach(icon => {
    icon.addEventListener("click", () => {
        const field = icon.dataset.field;
        if (field === "changeEmail") {
            changeEmailContainer.style.display = "none"
            document.body.style.overflow = "auto";
            emailChange.style.display = "none";
            otpVerify.style.display = "none";
            emailChange.reset();
            otpVerify.reset();
        }
        if (field === "changePass") {
            changePassContainer.style.display = "none";
            document.body.style.overflow = "auto";
        }
        if (field === "changeProfileData") {
            changeEmailContainer.style.display = "none"
            document.body.style.overflow = "auto";
        }
    });
});

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

changePassForm.addEventListener("submit", async function (e) {
    pageLoader.style.display = "flex";
    e.preventDefault();

    passError.innerText = "";

    const current = currentPass.value.trim();
    const newPassword = newPass.value.trim();
    const confirm = confirmPass.value.trim();

    // Empty check
    if (!current || !newPassword || !confirm) {
        passError.innerText = "All fields are required.";
        passError.style.color = "#ef4444";
        pageLoader.style.display = "none";
        return;
    }

    // Length check
    if (current.length < 6) {
        passError.innerText = "Current password must be at least 6 characters.";
        passError.style.color = "#ef4444";
        pageLoader.style.display = "none";
        return;
    }

    if (newPassword.length < 6) {
        passError.innerText = "Password must be at least 6 characters";
        passError.style.color = "#ef4444";
        pageLoader.style.display = "none";
        return;
    }

    if (newPassword !== confirm) {
        passError.innerText = "New password and confirm password must be the same.";
        passError.style.color = "#ef4444";
        pageLoader.style.display = "none";
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

        changePassForm.reset();
        afterPassRest();
    } catch (error) {
        passError.style.color = "white";

        if (error.code === "auth/wrong-password") {
            passError.style.color = "#ff0000";
            passError.innerText = "Incorrect current password";
        } else {
            passError.innerText = "Password update failed";
        }
    }
    passError.style.display = "block";
    pageLoader.style.display = "none";
});

forgotPass.addEventListener("click", async () => {
    pageLoader.style.display = "flex";
    const user = auth.currentUser;
    try {
        await sendPasswordResetEmail(auth, user.email);
        passError.style.color = "#00ff88";
        passError.innerHTML = "Password reset link sent to your email ✔<br>Check Spam Folder";
        afterPassRest();
    }
    catch {
        passError.style.color = "red";
        passError.innerText = "Something went wrong";
    }
    pageLoader.style.display = "none";
    passError.style.display = "block";
});

function afterPassRest() {
    setTimeout(() => {
        alert("Please login with your credentials.");
        logoutUser();
    }, 1500);
};



async function deleteAccount(password) {
    const user = auth.currentUser;

    try {
        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);

        sessionStorage.clear();
        localStorage.clear();

        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);

        redirectToIndex();
        return;
    } catch (error) {
        console.log("...");
    }
}


document.addEventListener("click", (e) => {
    const icon = e.target.closest(".editIcon");
    if (!icon) return;

    const field = icon.dataset.field;

    if (field === "email") {
        document.body.style.overflow = "hidden";
        emailChangeContainer.style.display = "block";
        profileEdit.style.display = "none";
        emailChangeContainerActive();
        editFieldMessage.innerText = "";
    }

    else if (field === "mobile") {
        document.body.style.overflow = "hidden";
        updateProfileInput.placeholder = `${userDataGlobal.mobile}`;
        profileEditHeading.innerText = "Update Your Mobile No.";
        emailChangeContainer.style.display = "none";
        changeEmailContainer.style.display = "flex";
        profileEdit.style.display = "block";
        editFieldMessage.innerText = "";
    }

    else if (field === "uni-roll") {
        document.body.style.overflow = "hidden";
        updateProfileInput.placeholder = "Enter Your University Roll No.";
        profileEditHeading.innerText = "Update Your University Roll";
        emailChangeContainer.style.display = "none";
        changeEmailContainer.style.display = "flex";
        profileEdit.style.display = "block";
        editFieldMessage.innerText = "";
    }
});

updateProfileform.addEventListener("submit", async (e) => {
    e.preventDefault();
    pageLoader.style.display = "flex";

    try {
        const value = updateProfileInput.value.trim();
        const user = auth.currentUser;

        if (!user) {
            alert("User not logged in");
            return;
        }

        if (!value) {
            alert("Field cannot be empty");
            return;
        }

        const userRef = doc(db, "users", user.uid);

        if (profileEditHeading.innerText === "Update Your Mobile No.") {

            if (!/^\d{10}$/.test(value)) {
                alert("Enter valid 10-digit mobile number");
                return;
            }
            editFieldMessage.innerText = "Updating......";

            await updateDoc(userRef, {
                mobile: value
            });

            editFieldMessage.innerText = "Mobile updated ✅";
        }

        else if (profileEditHeading.innerText === "Update Your University Roll") {
            if (userDataGlobal.universityRoll !== "") {
                alert("Gar Maraccho????");
                return;
            }

            if (value.length === 11) {
                editFieldMessage.innerText = "Updating......";

                await updateDoc(userRef, {
                    universityRoll: value
                });

                editFieldMessage.innerText = "University Roll Updated ✅";
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                editFieldMessage.innerText = "Invalid Roll ❌";
            }
        }

    } catch (error) {
        console.error(error);
        editFieldMessage.innerText = "Update failed ❌";
    } finally {
        pageLoader.style.display = "none";
        updateProfileform.reset();
    }
});

function emailChangeContainerActive() {
    changeEmailContainer.style.display = "flex";
    emailChange.style.display = "flex";
}


emailChange.addEventListener("submit", async function (e) {
    pageLoader.style.display = "flex";
    e.preventDefault();
    const gmailChangeEmail = document.getElementById("gmailChangeEmail").value.trim();
    const gmailChangePassword = document.getElementById("gmailChangePassword").value.trim();
    newEmailGlobal = gmailChangeEmail;
    if (gmailChangeEmail === userDataGlobal.email) {
        editFieldMessage.innerHTML = "⚠️ You are already using this email address";
        pageLoader.style.display = "none";
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
            user.email,
            gmailChangePassword
        );
        await reauthenticateWithCredential(user, credential);
        await sendOTP(userDataGlobal.name, gmailChangeEmail);
        emailChange.reset();
    }
    catch (error) {
        let message = "";

        if (error.code === "auth/wrong-password") {
            message = "❌ Incorrect password";
        }
        else if (error.code === "auth/invalid-email") {
            message = "❌ Invalid email address";
        }
        else if (error.code === "auth/user-not-found") {
            message = "❌ User not found";
        }
        else if (error.code === "auth/too-many-requests") {
            message = "⚠️ Too many attempts. Try again later";
        }
        else if (error.code === "auth/network-request-failed") {
            message = "🌐 Network error. Check your connection";
        }
        else {
            message = "❌ Something went wrong. Try again";
        }

        editFieldMessage.innerHTML = message;
        editFieldMessage.style.color = "red";
    } finally {
        pageLoader.style.display = "none";
    }
});

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

    const masked = email.replace(/(.{2}).+(@.+)/, "$1****$2");

    emailChange.style.display = "none";
    otpVerify.style.display = "flex";
    editFieldMessage.innerHTML = `We've sent a 6-digit OTP to your email<br>${masked}`;
}

otpVerify.addEventListener("submit", async function (e) {
    e.preventDefault();
    pageLoader.style.display = "flex";

    try {
        const otpInput = document.getElementById("otpInput").value.trim();

        const ref = doc(db, "otp", newEmailGlobal);

        const docSnap = await getDoc(ref);

        if (!docSnap.exists()) {
            editFieldMessage.innerHTML = `OTP expired or not found`;
            return;
        }

        const data = docSnap.data();
        const storedOtp = data.otp;

        if (Date.now() > data.expire) {
            editFieldMessage.innerHTML = `OTP expired ⏰`;
            await deleteDoc(ref);
            return;
        }

        if (data.attempts >= 3) {
            editFieldMessage.innerHTML = `Too many attempts ❌`;
            await deleteDoc(ref);
            return;
        }

        if (Number(otpInput) === storedOtp) {
            editFieldMessage.innerHTML = `OTP Verified ✅`;
            await deleteDoc(ref);

            await updateUserEmail(newEmailGlobal);
            otpVerify.reset();
        } else {
            editFieldMessage.innerHTML = `Wrong OTP ❌`;
            await updateDoc(ref, {
                attempts: data.attempts + 1
            });
        }

    } catch (error) {
        alert("Something went wrong");
    } finally {
        pageLoader.style.display = "none";
    }
});

async function updateUserEmail(pendingEmail) {
    const user = auth.currentUser;

    try {
        await updateEmail(user, pendingEmail);

        await updateDoc(doc(db, "users", user.uid), {
            email: pendingEmail
        });
        editFieldMessage.innerHTML = "Email Change Succesfull";
        pageLoader.style.display = "none";
    }
    catch (error) {

        if (error.code === "auth/email-already-in-use") {
            editFieldMessage.innerHTML = "❌ This email is already in use";
            editFieldMessage.style.color = "red";
        }
        else if (error.code === "auth/invalid-email") {
            editFieldMessage.innerHTML = "❌ Invalid email format";
        }
        else if (error.code === "auth/requires-recent-login") {
            editFieldMessage.innerHTML = "⚠️ Session expired. Please login again";
        }
        else {
            editFieldMessage.innerHTML = "❌ Failed to update email";
        }
    }
    finally {
        pageLoader.style.display = "none";
    }
}

function uniupdatepossiable(udata) {
    if (udata.universityRoll === "") {
        const icon = document.createElement("i");
        icon.className = "fa-regular fa-pen-to-square editIcon";
        icon.dataset.field = "uni-roll";

        uniuUpdate.appendChild(icon);
    };
};
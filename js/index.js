let loginType = ["student"];
let timeLeft = 30;
let countdown;
const loginHeading = document.getElementById("loginHeading");
const teacherButton = document.getElementById("teacherButton");
const studentButton = document.getElementById("studentButton");
const loginContainer = document.getElementById("loginContainer");
const signupTextOnLogin = document.getElementById("signupTextOnLogin");
const closeButton = document.getElementById("closeButton");
const signupCloseButton = document.getElementById("signupCloseButton");
const signupContainer = document.getElementById("signupContainer");
const signupButton = document.getElementById("signupButton");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const result = document.getElementById("result");
const aoihgf = "student";
const continue2Signup = document.getElementById("continue2Signup");
const slipVerify = document.getElementById("slipVerify");
const slipverifyButton = document.getElementById("slipverifyButton");
const otpVerifyContainer = document.getElementById("otpVerifyContainer");
const timerText = document.getElementById("timer");
const resendBtn = document.getElementById("resendBtn");

if (sessionStorage.getItem("slipVerified") === "true") {
    signupContainer.style.display = "flex";
}

input.addEventListener("change", async function () {

    const file = input.files[0];
    if (!file) return;

    preview.style.marginBottom = "15px";
    preview.style.border = "3px solid rgba(255,255,255,0.5)";
    preview.src = URL.createObjectURL(file);

    progressBar.value = 0;
    progressText.style.display = "block";
    result.style.display = "block";
    continue2Signup.style.display = "none";

    result.innerText = "Checking slip...";
    progressText.innerText = "Starting...";

    try {

        const {
            data: { text } }
            = await Tesseract.recognize(file, "eng", {
                logger: m => {
                    if (m.status === "recognizing text") {
                        let percent = Math.floor(m.progress * 100);
                        progressBar.value = percent;
                        progressText.innerText = `Processing ${percent}%`;
                    }
                }
            });

        let detectedText = text.toLowerCase();

        let hasInstitute =
            detectedText.includes("management") &&
            detectedText.includes("institute") &&
            detectedText.includes("of") &&
            detectedText.includes("durgapur") &&
            detectedText.includes("amount");

        let hasReceipt =
            detectedText.includes("rajbandh") &&
            detectedText.includes("receipt") &&
            detectedText.includes("voucher");

        if (hasInstitute && hasReceipt) {
            result.innerText = "✅ Verified Receipt Voucher";
            result.style.color = "#00ff99";
            continue2Signup.style.display = "flex";
            sessionStorage.setItem("slipVerified", "true");

            continue2Signup.onclick = () => {
                location.reload(true);
            };
        } else {
            result.innerText = "❌ Invalid Slip";
            result.style.color = "#ff4d4d";
            sessionStorage.setItem("slipVerified", "false");
        }

        progressText.innerText = "Completed";

    } catch (error) {
        result.innerText = "❌ Error processing slip";
        result.style.color = "#ff4d4d";
        progressText.innerText = "Failed";
    }
});


teacherButton.onclick = () => {
    loginType = ["teacher", "admin"];
    loginHeading.innerText = "Teacher Login";
    loginContainer.style.display = "flex";
    signupTextOnLogin.style.display = "none";
};

studentButton.onclick = () => {
    studentLoginPopup();
};

function studentLoginPopup() {
    loginType = ["student"];
    loginHeading.innerText = "Student Login";
    loginContainer.style.display = "flex";
    signupTextOnLogin.style.display = "block";
}


closeButton.onclick = () => {
    loginContainer.style.display = "none";
};

slipverifyButton.onclick = () => {
    slipVerify.style.display = "none";
};

signupCloseButton.onclick = () => {
    signupContainer.style.display = "none";
    sessionStorage.removeItem("slipVerified");
};

signupButton.onclick = () => {
    loginContainer.style.display = "none";
    slipVerify.style.display = "flex";
};
const heading = document.querySelector("#form-heading");
const hideElements = document.querySelectorAll(".field-container");
const submitBtn = document.querySelector("#edit-save");
const text = document.querySelector("#below-text");
const state = document.querySelector("#change-state");




hideElements.forEach((ele) => {
    ele.style.display = "none";
})

// state.addEventListener("click", (e) => {
//     if (e.target.innerText !== "Signup")
//         return;

//     // if (e.target.innerText === "Signup" && signupMode === false) {
//         heading.innerText = "Teacher Signup Form";
//         hideElements.forEach((ele) => {
//             ele.style.display = "flex";
//         })
//         submitBtn.innerText = "Signup";
//         text.innerHTML = `<p id="below-text">Already have account? <span id="change-state">Login</span></p>`;
//         e.target.innerText = "Login";
//         signupMode = true;
//     // }
// });


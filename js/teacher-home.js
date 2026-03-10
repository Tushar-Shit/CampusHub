const storedData = localStorage.getItem("TEACHER");
const actualData = JSON.parse(storedData);
// console.log(actualData.dept);
//selecting the fields where changes need
const tname = document.querySelector("#teacher-name");
const designation = document.querySelector("#teacher-role");
const email = document.querySelector("#teacher-email");
const phNo = document.querySelector("#teacher-phone");
const dept = document.querySelector("#teacher-dept");
const rightHeadName = document.querySelector("#right-head-name");

//set the fields from signup values aditya you need changes
tname.innerText = actualData.name.trim();
rightHeadName.innerText = actualData.name.toUpperCase();
designation.innerText = actualData.designation;
email.innerText = actualData.email;
phNo.innerText = actualData.phone;
dept.innerText = actualData.dept;

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
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});



// profile edit logic
const editBtn = document.querySelector("#edit-name-details");
const crossBtn = document.querySelector("#cross-btn");
const editPopup = document.querySelector("#edit-popup");

//fields inside the popup form

//form values
let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editDept = document.querySelector("input[name='edit-dept']:checked");

//fill the popup fields initially
editedName.value = tname.innerText;
editDesignation.value = designation.innerText;
editEmail.value = email.innerText;
editPhNo.value = phNo.innerText;


//profile edit popup show
editBtn.addEventListener("click", function (e) {
    if (e.target.nodeName !== "I") return;

    editPopup.style.display = "block";
    editPopup.classList.remove("state-hide");
    editPopup.classList.add("state-show");
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
const editDetails = {
    name: actualData.name,
    designation: actualData.designation,
    email: actualData.email,
    phone: actualData.phone
};

editSaveBtn.addEventListener("click", function (e) {
    // e.preventDefault();
    if (editedName.value !== "") editDetails["name"] = editedName.value;
    if (editDesignation.value !== "") editDetails["designation"] = editDesignation.value;
    if (editEmail.value !== "") editDetails["email"] = editEmail.value;
    if (editPhNo.value !== "") editDetails["phone"] = editPhNo.value;
    console.log(editDetails);
    localStorage.setItem("TEACHER", JSON.stringify(editDetails));


    storedData = localStorage.getItem("TEACHER");
    actualData = JSON.parse(storedData);
    tname.innerText = actualData.name;
    designation.innerText = actualData.designation;
    email.innerText = actualData.email;
    phNo.innerText = actualData.phone;


    // editPopup.classList.remove("state-show");
    // editPopup.classList.add("state-hide");
    // editPopup.style.display = "none";
});






































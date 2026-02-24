const editSaveBtn = document.querySelector("#edit-popup");

let editedName = document.querySelector("#edit-name");
let editDesignation = document.querySelector("#edit-designation");
let editEmail = document.querySelector("#edit-email");
let editPhNo = document.querySelector("#edit-ph-no");
let editDept = document.querySelector("input[name='edit-dept']:checked");



const teacher = {
    name: "",
    designation: "",
    email: "",
    phone: "",
    dept: ""
};

editSaveBtn.addEventListener("submit", function (e) {
    e.preventDefault();


    teacher["name"] = editedName.value;
    teacher["designation"] = editDesignation.value;
    teacher["email"] = editEmail.value;
    teacher["phone"] = editPhNo.value;
    teacher["dept"] = document.querySelector("input[name='edit-dept']:checked").value;
    console.log(teacher);
    localStorage.setItem("TEACHER", JSON.stringify(teacher));
    window.location.href = "gemini2.html";

})
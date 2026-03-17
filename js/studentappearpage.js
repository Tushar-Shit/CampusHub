const editIcon = document.querySelectorAll(".editIcon");
const cancelIcon = document.querySelectorAll(".cancelIcon");
const userLogo = document.getElementById("userLogo");
const applyForSemester = document.getElementById("applyForSemesterButton");
const createFeesStructure = document.getElementById("feeStructureButton");

applyForSemester.onclick = () => location.href = "./studentexamapperform.html";

function getElements(icon) {
    const box = icon.closest("div");
    return {
        span: box.querySelector("span"),
        input: box.querySelector("input"),
        edit: box.querySelector(".editIcon"),
        cancel: box.querySelector(".cancelIcon"),
        save: box.querySelector(".saveIcon")
    };
}

document.addEventListener("click", function (e) {

    const edit = e.target.closest(".editIcon");
    if (edit) {
        const { span, input, edit: editBtn, cancel, save } = getElements(edit);

        span.style.display = "none";
        editBtn.style.display = "none";
        input.style.display = "flex";
        cancel.style.display = "flex";
        save.style.display = "flex";

        input.focus();
        return;
    }

    const cancel = e.target.closest(".cancelIcon");
    if (cancel) {
        const { span, input, edit, cancel: cancelBtn, save } = getElements(cancel);

        span.style.display = "flex";
        edit.style.display = "flex";
        input.style.display = "none";
        cancelBtn.style.display = "none";
        save.style.display = "none";

        input.value = "";
    }

});

createFeesStructure.addEventListener("click",()=>alert("Wait dude, we're working here."));
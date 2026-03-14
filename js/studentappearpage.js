const editIcon = document.querySelectorAll(".editIcon");
const cancelIcon = document.querySelectorAll(".cancelIcon");
const userLogo = document.getElementById("userLogo");
const applyForSemester = document.getElementById("applyForSemesterButton");

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

editIcon.forEach(icon => {
    icon.onclick = function () {
        const { span, input, edit, cancel, save } = getElements(this);

        span.style.display = edit.style.display = "none";
        input.style.display = cancel.style.display = save.style.display = "flex";

        input.focus();
    };
});

cancelIcon.forEach(icon => {
    icon.onclick = function () {
        const { span, input, edit, cancel, save } = getElements(this);

        span.style.display = edit.style.display = "flex";
        input.style.display = cancel.style.display = save.style.display = "none";

        input.value = "";
    };
});
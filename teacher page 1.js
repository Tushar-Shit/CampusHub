//extract stream names from local storage
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;

//selection commitee
const container = document.querySelector("#sem-container");
const rightSide = document.querySelector("#right-side");
const altRightSide = document.querySelector("#alternative-right-side");
const rightHeading = document.querySelector("#right-heading");
const spBtnContainer = document.querySelector("#right-top");
const rightBottom = document.querySelector("#right-bottom");
const altRightBottom = document.querySelector("#alternative-right-bottom");

rightSide.style.display = "none";
altRightSide.style.display = "block";
let currentClick = null;

//for specific button selection
rightBottom.style.display = "none";
altRightBottom.style.display = "block";

//clicking semester
container.addEventListener("click", function (e) {
    if (e.target.nodeName !== "BUTTON") return;

    if (currentClick == null) {
        check(e.target);
    }
    else if (currentClick == e.target) {
        e.target.classList.remove("clicked-bgcolor");
        e.target.classList.add("pre-bgcolor", "forhover");
        rightSide.style.display = "none";
        altRightSide.style.display = "block";
        currentClick = null;

    } else {
        currentClick.classList.remove("clicked-bgcolor");
        currentClick.classList.add("pre-bgcolor", "forhover");
        rightBottom.style.display = "none";
        altRightBottom.style.display = "block";

        if (whichBtn !== null) {
            whichBtn.classList.remove("after-clicked");
            whichBtn.classList.add("before-clicked", "forhover");
            whichBtn = null;
        }
        check(e.target);
    }


})
function check(tip) {
    tip.classList.remove("pre-bgcolor", "forhover");
    tip.classList.add("clicked-bgcolor");

    altRightSide.style.display = "none";
    rightSide.style.display = "block";

    rightHeading.innerText = `${stream} ${tip.innerText}`;
    currentClick = tip;
}



let currentSem = null;
let whichBtn = null;
let sem = null;
spBtnContainer.addEventListener("click", function (e) {
    if (e.target.nodeName !== "BUTTON" || currentClick === null) return;

    sem = currentClick;

    if (whichBtn === null) {
        func(e.target, sem);
        currentSem = sem;
    }
    else if (whichBtn === e.target) {
        e.target.classList.remove("after-clicked");
        e.target.classList.add("forhover", "before-clicked");

        rightBottom.style.display = "none";
        altRightBottom.style.display = "block";

        whichBtn = null;
    }
    else {
        whichBtn.classList.remove("after-clicked");
        whichBtn.classList.add("before-clicked", "forhover");

        e.target.classList.remove("forhover", "before-clicked");
        e.target.classList.add("after-clicked");

        rightBottom.style.display = "block";
        altRightBottom.style.display = "none";
        rightBottom.innerText = `${sem.innerText} ${e.target.innerText}`;

        whichBtn = e.target;
    }
});


function func(button, sem) {
    button.classList.remove("before-clicked", "forhover");
    button.classList.add("after-clicked");
    rightBottom.innerText = `${sem.innerText} ${button.innerText}`
    altRightBottom.style.display = "none";
    rightBottom.style.display = "block";
    whichBtn = button;
}

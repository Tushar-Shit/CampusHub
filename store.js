//extract stream names from local storage
const mainHeading = document.querySelector("#heading");
const stream = localStorage.getItem("stream");
mainHeading.innerText = `${stream} SEMESTERS`;

//for semester selection
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


container.addEventListener("click", function (e) {
    if (e.target.nodeName === "BUTTON") {
        if (currentClick == null) {
            check(e.target);
            specificBotton(e.target);
        }
        else if (currentClick == e.target) {
            e.target.classList.remove("clicked-bgcolor");
            e.target.classList.add("pre-bgcolor");
            e.target.classList.add("forhover");
            rightSide.style.display = "none";
            altRightSide.style.display = "block";
            currentClick = null;

        } else {
            currentClick.classList.remove("clicked-bgcolor");
            currentClick.classList.add("pre-bgcolor");
            currentClick.classList.add("forhover");
            rightBottom.style.display = "none";
            altRightBottom.style.display = "block";
            check(e.target);
            specificBotton(e.target);
        }
    }

})

//changing semester button color and heading
function check(tip) {
    tip.classList.remove("pre-bgcolor");
    tip.classList.remove("forhover");
    tip.classList.add("clicked-bgcolor");
    altRightSide.style.display = "none";
    rightSide.style.display = "block";
    rightHeading.innerText = `${stream} ${tip.innerText}`;
    currentClick = tip;
}



let currentSem = null;
let whichBtn = null;
function specificBotton(sem) {
    spBtnContainer.addEventListener("click", function (e) {
        if (e.target.nodeName === "BUTTON") {

            if (whichBtn === null && (currentSem === null || currentSem === sem)) {
                func(e.target, sem);
                whichBtn = e.target;
                currentSem = sem;
            }
            else if (currentSem === sem && whichBtn === e.target) {
                e.target.classList.remove("after-clicked");
                e.target.classList.add("forhover");
                e.target.classList.add("before-clicked");
                rightBottom.style.display = "none";
                altRightBottom.style.display = "block";
                whichBtn = null;

            }
            else if (whichBtn !== e.target && currentSem === sem) {
                whichBtn.classList.remove("after-clicked");
                whichBtn.classList.add("before-clicked");
                whichBtn.classList.add("forhover");
                e.target.classList.remove("forhover");
                e.target.classList.remove("before-clicked");
                e.target.classList.add("after-clicked");
                rightBottom.style.display = "block";
                altRightBottom.style.display = "none";
                rightBottom.innerText = `${sem.innerText} ${e.target.innerText}`
                whichBtn = e.target;
            }
            else if (currentSem !== sem && whichBtn === e.target) {
                whichBtn.classList.remove("after-clicked");
                whichBtn.classList.add("before-clicked");
                whichBtn.classList.add("forhover");
                e.target.classList.remove("after-clicked");
                e.target.classList.add("before-clicked");
                e.target.classList.add("forhover");
                // func(e.target, sem);
                whichBtn = null;
                currentSem = sem;
            }

        }
    })
}

function func(button, sem) {
    button.classList.remove("before-clicked");
    button.classList.remove("forhover");
    button.classList.add("after-clicked");
    rightBottom.innerText = `${sem.innerText} ${button.innerText}`
    altRightBottom.style.display = "none";
    rightBottom.style.display = "block";
    // whichBtn = button;
    // currentSem = sem;
}

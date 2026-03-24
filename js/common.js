// document.addEventListener("selectstart", function (e) {
//     e.preventDefault();
// });

// document.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
// });

// document.addEventListener("keydown", (e) => {
//   // F12
//   if (e.key === "F12") {
//     e.preventDefault();
//   }

//   // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+U
//   if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) {
//     e.preventDefault();
//   }

//   if (e.ctrlKey && e.key === "U") {
//     e.preventDefault();
//   }
// });

// setInterval(() => {
//   const devtoolsOpen = window.outerWidth - window.innerWidth > 160 || 
//                        window.outerHeight - window.innerHeight > 160;

//   if (devtoolsOpen) {
//     document.body.innerHTML = "";
//   }
// }, 1000);


// setInterval(() => {
//   debugger;
// }, 100);
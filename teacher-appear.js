const items=document.querySelectorAll(".dept-option");

items.forEach(item=>{
    item.addEventListener("click",function(){
        const key=this.innerText;
        localStorage.setItem("stream",key);
        window.location.href="Teacher-page-1.html";
    })
});
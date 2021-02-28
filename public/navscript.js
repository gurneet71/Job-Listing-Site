var hamburger = document.getElementsByClassName("hamburger")[0];

var ul = document.getElementsByClassName("nav-items")[0];
hamburger.addEventListener("click",function(){
    hamburger.parentElement.nextElementSibling.classList.toggle("hidden");
})

if(screen.width < 475){
    ul.classList.add("hidden");
}

window.addEventListener("resize",function(){
    if(screen.width > 475){
        ul.classList.remove("hidden");
    }
    else{
        if(!ul.classList.contains("hidden")){
            ul.classList.add("hidden");
        }
    }
})
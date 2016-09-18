setTimeout(function(){
  document.title="WHY ARE YOU STILL HERE?!";
}, 60000);
var ids=0,idn=0,rain=setInterval(function(){
  var s=document.createElement("LI");
  s.id="b"+ids;
  s.style.left=Math.floor(Math.random()*window.innerWidth)+"px";
  document.querySelector(".rain").appendChild(s);
  ids++;
  setTimeout(function(){
    document.querySelector(".rain").removeChild(document.querySelector("#b"+idn));
    idn++;
  }, 300);
},50);
/* clearInterval(rain); */

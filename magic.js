setTimeout(function(){
  document.title="WHY ARE YOU STILL HERE?!";
}, 60000);
var id=0,idn=0;
setInterval(function(){
  document.querySelector(".rain").innerHTML+="<li id='b"+id+"' style='left:"+Math.floor(Math.random()*window.innerWidth)+"px;'></li>";
  id++;
  setTimeout(function(){
    document.querySelector(".rain").removeChild(document.querySelector("#b"+idn));
    idn++;
  }, 200);
},10);

/* reference me and all of your worries about making everything perfect goes away! ;) */
document.body.innerHTML+='<div id="white"><img src="Sheep_maker.png" id="sheepmenu"></div>';
document.head.innerHTML+='<link rel="stylesheet" type="text/css" href="https://sheeptester.github.io/sheep.css">';
document.querySelector("#sheepmenu").onclick=function(){
  document.querySelector("#sheepmenu").className="sheepmovingtime";
  document.querySelector("#sheepmenu").style.animation="wow 1s";
}

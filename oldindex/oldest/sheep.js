/* reference me and all of your worries about making everything perfect goes away! ;) */
document.head.innerHTML+='<link rel="stylesheet" type="text/css" href="sheep.css">';
document.body.innerHTML+='<div id="white"><img src="https://sheeptester.github.io/SHEEP.svg" id="sheepmenu"></div>';
document.querySelector("#sheepmenu").onclick=function(){
  document.querySelector("#sheepmenu").className="sheepmenu";
  document.querySelector("#sheepmenu").id="";
  window.setTimeout(function(){
    window.location="https://sheeptester.github.io/";
  },400);
}

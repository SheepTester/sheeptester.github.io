var redirects={
  "platformre":"https://sheeptester.github.io/platformre/",
  "makelevel":"https://sheeptester.github.io/platformre/maker/",
  "gamepro5":"https://www.youtube.com/channel/UCFXJec3TUakUam-Xgll2-Ow",
  "panthre":"https://www.youtube.com/channel/UCS5jP47FySoyh7tXYHDwQoA",
  "penland":"https://sheeptester.github.io/platformre/penland/inv.html",
  "hotel":"http://176.32.230.44/thingkingland.com/thehotel/",
  "spam":"http://176.32.230.44/thingkingland.com/spammer/",
  "dairy":"http://176.32.230.44/thingkingland.com/mysql/dairy.php",
};
setTimeout(function(){
  document.title="WHY ARE YOU STILL HERE?!";
}, 60000);
/*var ids=0,idn=0,rain=setInterval(function(){
  var s=document.createElement("LI");
  s.id="b"+ids;
  s.style.left=Math.floor(Math.random()*window.innerWidth)+"px";
  document.querySelector(".rain").appendChild(s);
  ids++;
  setTimeout(function(){
    document.querySelector(".rain").removeChild(document.querySelector("#b"+idn));
    idn++;
  }, 300);
},50);*/
//clearInterval(rain);
window.onload=function() {
  if (window.location.hash) {
    document.querySelector(".active").className="";
    document.querySelector(".pgactive").className="";
    document.querySelector("#btn"+window.location.hash.slice(1)).className="active";
    document.querySelector("#pg"+window.location.hash.slice(1)).className="pgactive";
  }
};
document.querySelector("#menu").onclick=function(e){
  if (e.target.tagName=="LI") {
    document.querySelector(".active").className="";
    document.querySelector(".pgactive").className="";
    e.target.className="active";
    document.querySelector("#pg"+e.target.id.slice(3)).className="pgactive";
    window.location.hash=e.target.id.slice(3);
  }
}
document.querySelector("#pgContact ul").onclick=function(e){
  if (e.target.tagName=="LI") {
    window.location={
      scr:"https://scratch.mit.edu/users/Sheep_maker/",
      git:"https://github.com/SheepTester",
      gpl:"https://plus.google.com/u/0/+SeanYentheHumansperson",
      ins:"https://www.instagram.com/sheeptester/",
      ytb:"https://www.youtube.com/channel/UCI8DtrWZvGNsXxUNkW53FAg",
    }[e.target.id];
  }
}
if (window.location.search) {
  var lol=window.location.search.slice(1);
  if (redirects.hasOwnProperty(lol)) window.location.replace(redirects[lol]);
  else if (lol[0]+lol[1]=="rr") window.location.replace("https://i.cloudup.com/LE0xyc4dgp.mp4");
  else if (lol[0]+lol[1]=="js") window.location.replace("https://akk.li/pics/anne.jpg");
  else if (lol.slice(0,11)=="javascript:") window.location.replace("https://sheeptester.github.io/");
  else window.location.replace(lol);
}
setInterval(function () {
  var age=new Date().getTime()-1049933280000;
  document.querySelector("#msage").innerHTML=age;
  document.querySelector("#yage").innerHTML=age/31557600000;
},100);

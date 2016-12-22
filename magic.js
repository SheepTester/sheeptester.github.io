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
  else if (lol.slice(0,9)=="existing=") {
    document.querySelector("#createform").style.display='block';
    document.querySelector("#createform .name").value=lol.slice(9);
    document.querySelector("#createform .error:first-of-type").innerHTML='User already exists.';
  }
  else if (lol.slice(0,8)=="badpass=") {
    document.querySelector("#loginform").style.display='block';
    document.querySelector("#loginform .name").value=lol.slice(8);
    document.querySelector("#loginform .error").innerHTML='Wrong password.';
  }
  else if (lol.slice(0,7)=="userid=") {
    window.localStorage.setItem('userid',Number(lol.slice(7)));
    window.location.search='';
  }
  else if (lol.slice(0,6)=="signin") {
    document.querySelector("#createform").style.display='block';
  }
  else window.location.replace(lol);
}
setInterval(function(){
  var age=new Date().getTime()-1049933280000;
  document.querySelector("#msage").innerHTML=age;
  document.querySelector("#yage").innerHTML=age/31557600000;
},100);
function httpGetAsync(theUrl,callback) {
  var xmlHttp=new XMLHttpRequest();
  xmlHttp.onreadystatechange=function(){
    if (xmlHttp.readyState==4&&xmlHttp.status==200) callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET",theUrl,true); // true for asynchronous
  xmlHttp.send(null);
}
var data={};
if (window.localStorage.getItem('userid')) {
  httpGetAsync('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/getstuff.php?userid='+window.localStorage.getItem('userid'),function(e){
    data=JSON.parse(e);
    document.querySelector("#createform").style.display='none';
    document.querySelector("#loginform").style.display='none';
    document.querySelector("#user").innerHTML="<li id='signout' class='clickable'>Sign out</li><li style='font-weight:bold;'>"+data.username+"</li>";
  });
} else {
  document.querySelector("#user").innerHTML="<li id='create' class='clickable'>Create account</li><li id='login' class='clickable'>Log in</li>";
}
document.querySelector("#user").onclick=function(e){
  switch (e.target.id) {
    case 'create':
      document.querySelector("#createform").style.display='block';
      break;
    case 'login':
      document.querySelector("#loginform").style.display='block';
      break;
    case 'signout':
      window.localStorage.removeItem('userid');
      window.location.replace('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/signout.php');
      break;
  }
};
document.querySelector("#createform .name").onchange=function(){
  var val=document.querySelector("#createform .name").value;
  if (!val) {
    document.querySelector("#createform .error:first-of-type").innerHTML='You need a username.';
    document.querySelector("#createform .done").disabled=true;
  } else {
    document.querySelector("#createform .error:first-of-type").innerHTML='';
    if (!document.querySelector("#createform .error:nth-of-type(2)").innerHTML) document.querySelector("#createform .done").disabled=false;
  }
};
document.querySelector("#createform .pass").onchange=function(){
  var val=document.querySelector("#createform .pass").value;
  if (val.length>4) {
    document.querySelector("#createform .error:nth-of-type(2)").innerHTML='Your password is too secure. It has to be at most 4 characters long.';
    document.querySelector("#createform .done").disabled=true;
  } else if (val!=document.querySelector("#createform .pass2").value) {
    document.querySelector("#createform .error:nth-of-type(2)").innerHTML='Your passwords don\'t match.';
    document.querySelector("#createform .done").disabled=true;
  } else {
    document.querySelector("#createform .error:nth-of-type(2)").innerHTML='';
    if (!document.querySelector("#createform .error:first-of-type").innerHTML) document.querySelector("#createform .done").disabled=false;
  }
};
document.querySelector("#createform .pass2").onchange=function(){
  var val=document.querySelector("#createform .pass2").value;
  if (val!=document.querySelector("#createform .pass").value) {
    document.querySelector("#createform .error:nth-of-type(2)").innerHTML='Your passwords don\'t match.';
    document.querySelector("#createform .done").disabled=true;
  } else {
    document.querySelector("#createform .error:nth-of-type(2)").innerHTML='';
    if (!document.querySelector("#createform .error:first-of-type").innerHTML) document.querySelector("#createform .done").disabled=false;
  }
};
document.querySelector("#createform .close").onclick=function(){
  document.querySelector("#createform").style.display='none';
};
document.querySelector("#loginform .close").onclick=function(){
  document.querySelector("#loginform").style.display='none';
};

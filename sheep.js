/* reference me and all of your worries about making everything perfect goes away! ;) */
var SHEEP=document.createElement("link");
SHEEP.type="text/css";
SHEEP.rel="stylesheet";
SHEEP.href="https://sheeptester.github.io/sheep.css";
document.head.appendChild(SHEEP);
SHEEP=document.createElement("sheepmenu");
document.body.appendChild(SHEEP);
document.querySelector("sheepmenu").onclick=function(){
  document.querySelector("sheepmenu").id="SHEEPANIMATING";
  window.setTimeout(function(){
    window.location="https://sheeptester.github.io/";
  },400);
};
if (!window.localStorage.dismissed) {
  window.localStorage.dismissed='{}';
}
SHEEP={
  notify:function(message,link){
    var s=document.createElement("sheepnotify"),link;
    s.innerHTML=message;
    if (link) {
      s.className='SHEEPLINKY';
      s.href=link;
      setTimeout(function(){
        s.className='SHEEPDISAPPEAR';
        setTimeout(function(){
          document.body.removeChild(s);
        },200);
      },3000);
      s.onclick=function(e){
        window.location.href=link;
      };
    } else {
      s.onclick=function(e){
        e.target.className='SHEEPDISAPPEAR';
        setTimeout(function(){
          document.body.removeChild(e.target);
        },200);
      };
    }
    document.body.appendChild(s);
  },
  dismissed:JSON.parse(window.localStorage.dismissed),
  dismiss:function(name){
    var dismissed=JSON.parse(window.localStorage.dismissed);
    dismissed[name]=1;
    window.localStorage.dismissed=JSON.stringify(dismissed);
    SHEEP.dismissed=JSON.parse(window.localStorage.dismissed);
  }
};
if (!SHEEP.dismissed.accounts) {
  SHEEP.dismiss('accounts');
  SHEEP.notify('A very insecure system of accounts has been introduced.','/?signin');
}

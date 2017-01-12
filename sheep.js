/* reference me and all of your worries about making everything perfect goes away! ;) */
(function(){
  var el=document.createElement("link");
  el.type="text/css";
  el.rel="stylesheet";
  el.href="https://sheeptester.github.io/sheep.css";
  document.head.appendChild(el);
  el=document.createElement("sheepmenu");
  document.body.appendChild(el);
  document.querySelector("sheepmenu").onclick=function(){
    document.querySelector("sheepmenu").id="SHEEPANIMATING";
    window.setTimeout(function(){
      window.location="https://sheeptester.github.io/";
    },400);
  };
  if (!window.localStorage.dismissed) {
    window.localStorage.dismissed='{}';
  }
})();
var SHEEP={
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
    SHEEP.dismissed[name]=1;
    window.localStorage.dismissed=JSON.stringify(SHEEP.dismissed);
  },
  undismiss:function(name){
    SHEEP.dismissed[name]=0;
    window.localStorage.dismissed=JSON.stringify(SHEEP.dismissed);
  },
  textwidth:function(elem,text){
    /*
      would
      (document.querySelector('input')) gets value of input using input's styling
      (document.querySelector('input'),'lol') uses input's style but a with custom value
      (document.querySelector('p')) uses text content of element using its styling
      (document.querySelector('p'),'lol') uses element's style but with custom text
      ('lol') uses text with inherit styling
      ('lol','15px monospace') uses text with custom styling
    */
    var text,font;
    if (typeof elem==='object') {
      font=document.defaultView.getComputedStyle(elem).font; // if its an element use its font
      if (!text) {
        if (elem.value) text=elem.value;
        else text=elem.textContent;
      }
    } else if (typeof elem==='string') {
      if (text) font=text;
      else {
        font='inherit';
        text=elem;
      }
    }
    let clone=document.createElement('sheepgettextwidth');
    clone.appendChild(document.createTextNode(text));
    clone.style.font=font;
    document.body.appendChild(clone);
    let smth=clone.offsetWidth;
    document.body.removeChild(clone);
    return smth;
  },
  search:function(input){
    if (typeof input==='string') {
      var result={},search=input;
      for (var i=1;i<search.length;i++) {
        var nextAmpersand=search.indexOf('&',i);
        var name;
        if (nextAmpersand>-1) {
          name=search.slice(i,nextAmpersand);
          i=nextAmpersand;
        } else {
          name=search.slice(i);
          i=search.length;
        }
        if (name.indexOf('=')>-1) {
          var value=name.slice(name.indexOf('=')+1);
          name=name.slice(0,name.indexOf('='));
          if (!isNaN(Number(value))) value=Number(value);
          else if (value=='true'||value=='✔') value=true;
          else if (value=='false'||value=='✖') value=false;
          result[name]=value;
        } else {
          result[name]=true;
        }
      }
      return result;
    } else if (typeof input==='object') {
      var result='?',object=input;
      for (var key in object) {
        if (result[result.length-1]=='?') result+=key+'='+object[key];
        else result+='&'+key+'='+object[key];
      }
      return result;
    }
    else return undefined;
  }
};
(function(){
  if (!SHEEP.dismissed.accounts) {
    SHEEP.dismiss('accounts');
    SHEEP.notify('A very insecure system of accounts has been introduced.','/?signin');
  }
  /*
                 _
        /\      | |
       /  \   __| |___
      / /\ \ / _` / __|
     / ____ \ (_| \__ \
    /_/    \_\__,_|___/
                           */
  if (!Math.floor(Math.random()*5)) {
    switch (true) {
      case !SHEEP.dismissed.leafism:
        SHEEP.dismiss('leafism');
        SHEEP.notify('Join the leaf cult!','https://sites.google.com/site/realaxolotls/members/michaela/triangle-bird-sign-ups/leafism');
        break;
      case !SHEEP.dismissed.gamepro5:
        SHEEP.dismiss('gamepro5');
        SHEEP.notify('Subscribe to Gamepro5!','/?gamepro5');
        break;
      case !SHEEP.dismissed.uselessbutwhatever:
        SHEEP.dismiss('uselessbutwhatever');
        SHEEP.notify('Visit the page you\'re already on!');
        break;
      case !SHEEP.dismissed.gaffachris:
        SHEEP.dismiss('gaffachris');
        SHEEP.notify('Watch quality trash!','/?gaffasaurus');
        break;
    }
  }
})();

var pat=document.querySelector('#pattern'),
pattern='',
text=document.querySelector('#text'),
letter='',
timeout,
dotlength=80,
clickytime,
time=document.querySelector('#time'),
suggests=document.querySelector('#suggestions'),
dict={},
dictionary=document.querySelector('#dict'),
options=document.querySelector('#stuff'),
disablemorsing=true,
beeper=document.querySelector('#beep'),
goal=document.querySelector('#goal'),
hear=document.querySelector('#lgoal'),
xmlHttp=new XMLHttpRequest();
if (SHEEP.dismissed.telegraphintro) {
  document.body.removeChild(document.querySelector('#madeby'));
  disablemorsing=false;
} else {
  setTimeout(_=>{
    document.body.removeChild(document.querySelector('#madeby'));
    disablemorsing=false;
    SHEEP.dismiss('telegraphintro');
  },500);
}
xmlHttp.onreadystatechange=function(){
  if (xmlHttp.readyState===4&&xmlHttp.status===200) {
    var t=xmlHttp.responseText.split(/\r?\n/);
    for (var i=0;i<t.length;i++) dict[t[i][0]]=t[i].slice(1);
    var s=document.createElement("table"),r,v=0;
    for (var span in dict) {
      if (v%3===0) r=document.createElement("tr");
      var u=document.createElement("th");
      if (span==='\b') {
        u.textContent='ERROR';
        u.colSpan='2';
      } else u.textContent=span;
      r.appendChild(u);
      u=document.createElement("td");
      u.textContent=dict[span].replace(/0/g,'·').replace(/1/g,'−');
      if (span==='\b') {
        u.colSpan='2';
        v+=2;
      }
      r.appendChild(u);
      if (v%3===2) s.appendChild(r),r=undefined;
      v++;
    }
    if (r) s.appendChild(r);
    dictionary.appendChild(s);
  }
};
xmlHttp.open("GET",'https://gist.githubusercontent.com/SheepTester/9945b4a49fad9ce059ccab7d56761b90/raw/morsecode.txt',true);
xmlHttp.send(null);
document.onmousedown=e=>{
  if (e.which!==3&&!options.contains(e.target)&&!disablemorsing&&!clickytime) {
    beeper.currentTime=0;
    beeper.play();
    clearTimeout(timeout);
    clickytime=+new Date();
    window.requestAnimationFrame(update);
    document.activeElement.blur();
    e.preventDefault();
  }
};
document.addEventListener("touchstart",document.onmousedown,{passive:false});
document.onkeydown=e=>{
  if (e.keyCode===32) document.onmousedown({which:1,preventDefault(){}});
};
document.onmouseup=e=>{
  if (e.which!==3) {
    if (!options.contains(e.target)&&!disablemorsing&&clickytime) {
      beeper.pause();
      if ((+new Date()-clickytime)/dotlength>=3) pattern+='-',letter+='1';
      else pattern+='.',letter+='0';
      pat.textContent=pattern;
      clickytime=undefined;
      suggest(letter);
      timeout=setTimeout(_=>{
        pattern+='/';
        letter='';
        pat.textContent=pattern;
        if (suggests.children[0]&&suggests.children[0].classList.contains('selected')) {
          var t=suggests.children[0].children[0].textContent;
          if (t==='ERROR') {
            t=text.textContent;
            if (t[t.length-1]===' ') t=t.slice(0,-1);
            if (~t.lastIndexOf(' ')) text.textContent=t.slice(0,t.lastIndexOf(' '));
            else text.textContent='';
          }
          else text.textContent+=t;
        }
        suggests.innerHTML='';
        t=text.textContent.slice(text.textContent.lastIndexOf(' ')+1);
        if (goals[t]&&!goals[t].classList.contains('unlocked')) {
          goals[t].classList.add('unlocked');
          goals[t].click();
        }
        timeout=setTimeout(_=>{
          pattern+='/';
          letter='';
          pat.textContent=pattern;
          if (text.textContent[text.textContent.length-1]!==' ') text.textContent+=' ';
        },dotlength*4);
      },dotlength*3);
    }
  }
};
document.addEventListener("touchend",document.onmouseup,{passive:false});
document.onkeyup=e=>{
  if (e.keyCode===32) document.onmouseup({which:1});
};
document.querySelector('#options').onclick=e=>{
  if (document.body.classList.contains('close')) {
    document.body.classList.remove('close');
  } else {
    document.body.classList.add('close');
  }
};
function update() {
  if (clickytime) {
    var dots=(+new Date()-clickytime)/dotlength;
    if (dots>9) time.style.borderLeftWidth=time.getBoundingClientRect().width+'px';
    else time.style.borderLeftWidth=(dots*(time.getBoundingClientRect().width/9))+'px';
    if (dots>=3) time.classList.add('dah');
    window.requestAnimationFrame(update);
  } else {
    time.style.borderLeftWidth='0';
    time.classList.remove('dah');
  }
}
function suggest(letter) {
  while (suggests.hasChildNodes()) suggests.removeChild(suggests.lastChild);
  if (letter) {
    var suggestions=[]; // . _
    for (var span in dict) {
      if (dict[span].slice(0,letter.length)===letter) suggestions.push(span);
    }
    suggestions.sort((a,b)=>dict[a].length-dict[b].length)
    for (var i=0;i<suggestions.length;i++) {
      var s=document.createElement('span'),
      pat=dict[suggestions[i]].replace(/0/g,'·').replace(/1/g,'−');
      if (i===0&&dict[suggestions[0]]===letter) s.classList.add('selected');
      var t=document.createElement("span");
      if (suggestions[i]==='\b') t.appendChild(document.createTextNode('ERROR'));
      else t.appendChild(document.createTextNode(suggestions[i]));
      t.classList.add('letter');
      s.appendChild(t);
      t=document.createElement("span");
      t.appendChild(document.createTextNode(pat.slice(0,letter.length)));
      t.classList.add('done');
      s.appendChild(t);
      t=document.createElement("span");
      t.appendChild(document.createTextNode(pat.slice(letter.length)));
      t.classList.add('notdone');
      s.appendChild(t);
      suggests.appendChild(s);
    }
  }
}
document.querySelector('#wpm .up').onclick=e=>{
  var span=e.target.parentNode.children[1],wpm=+span.innerHTML;
  if (wpm<99) {
    dotlength=1200/(wpm+1);
    span.innerHTML=wpm+1;
  }
};
document.querySelector('#wpm .down').onclick=e=>{
  var span=e.target.parentNode.children[1],wpm=+span.innerHTML;
  if (wpm>1) {
    dotlength=1200/(wpm-1);
    span.innerHTML=wpm-1;
  }
};
document.querySelector('#clear').onclick=e=>{
  text.textContent='';
  pattern='';
  pat.textContent=pattern;
};
function popup(content) {
  disablemorsing=true;
  var shadow=document.createElement("div");
  shadow.classList.add('shadow');
  document.body.appendChild(shadow);
  var dialogue=document.createElement("div");
  dialogue.classList.add('popup');
  var p=document.createElement("p");
  p.innerHTML=content;
  dialogue.appendChild(p);
  var close=document.createElement("span");
  close.classList.add('close');
  close.innerHTML='okay';
  close.onclick=e=>{
    disablemorsing=false;
    shadow.classList.remove('showing');
    dialogue.classList.remove('showing');
    setTimeout(_=>{
      document.body.removeChild(shadow);
      document.body.removeChild(dialogue);
    },200);
  };
  dialogue.appendChild(close);
  document.body.appendChild(dialogue);
  setTimeout(_=>{
    shadow.classList.add('showing');
    dialogue.classList.add('showing');
  },0);
}
for (var span in goals) {
  var s=document.createElement("span"),
  goalmessage=goals[span];
  s.innerHTML=span;
  ((s,goalmessage)=>{
    s.onclick=e=>{
      if (s.classList.contains('unlocked')) popup(goalmessage);
    };
  })(s,goalmessage);
  if (span==='H4X0R') s.style.display='none';
  goal.appendChild(s);
  goals[span]=s;
}
for (var span in hearing)
  (span=>{
    var s=document.createElement("div"),
    t=document.createElement("button"),
    u=document.createElement("input"),
    goalmessage=hearing[span];
    t.onclick=e=>{
      t.disabled=disablemorsing=true;
      for (var i=0,dots=0;i<span.length;i++) {
        var patte=dict[span[i]];
        for (var j=0;j<patte.length;j++) {
          if (patte[j]==='0') {
            setTimeout(_=>beeper.play(),dots*dotlength);
            dots++;
            setTimeout(_=>beeper.pause(),dots*dotlength);
            dots++;
          } else {
            setTimeout(_=>beeper.play(),dots*dotlength);
            dots+=3;
            setTimeout(_=>beeper.pause(),dots*dotlength);
            dots++;
          }
          if (i===span.length-1) setTimeout(_=>t.disabled=disablemorsing=false,dots*dotlength);
        }
        dots+=2;
      }
    };
    s.appendChild(t);
    u.onchange=e=>{
      if (u.value.toUpperCase()===span) {
        s.classList.add('unlocked');
        popup(goalmessage);
        u.disabled=true;
      }
    };
    u.placeholder='put guess here';
    s.onclick=e=>{
      if (e.target!==t&&s.classList.contains('unlocked')) popup(goalmessage);
    };
    s.appendChild(u);
    hear.appendChild(s);
    hearing[span]=s;
  })(span);
timeout=setTimeout(_=>{
  SHEEP.notify('Oh yeah, click/tap to use the telegraph.');
},3000);
(function() {
  var s=document.querySelectorAll('#credits a');
  for (var i=0;i<s.length;i++) if (!s[i].href) s[i].href='//'+s[i].innerHTML;
}());
function unlockall(p) {
  if (!p) return 'nope';
  var t=document.querySelectorAll(`${p[17]}${p[8]}${p[2]}${p[7]}${p[3]}${p[0]}${p[13]}${p[6]}${p[7]}${p[16]}`);
  if (t.length===0) return 'nope';
  for (var i=0;i<t.length;i++) t[i].classList.add('unlocked');
  t=document.querySelectorAll(`${p[17]}${p[3]}${p[8]}${p[2]}${p[7]}${p[3]}${p[0]}${p[1]}${p[12]}${p[11]}`);
  for (var i=0;i<t.length;i++) {
    t[i].classList.add('unlocked');
    t[i].children[1].disabled=true;
  }
  return 'sure';
  /*
    GUESS THE PASSWORD
    ' '+fruit company name that means sorrow or mourning+' '+unit for twice the number of papers in a book+' '+visean+'#'
  */
}

var sheeptest=(function(){
  if (document.querySelector('sheepmenu')) {
    document.querySelector('sheepmenu').classList.add('blockvision');
  }
  if (window.SHEEP) delete SHEEP.menu['go to index page'];
  var bulletWidth;
  document.body.onload=_=>{
    document.body.classList.remove('blank');
    if (document.querySelector('sheepmenu')) {
      document.querySelector('sheepmenu').classList.add('playhellos');
      setTimeout(_=>document.querySelector('sheepmenu').classList.remove('blockvision'),0);
      setTimeout(_=>document.querySelector('sheepmenu').classList.remove('playhellos'),500);
    }
    var clone=document.createElement('span');
    clone.className='getTextLength';
    clone.innerHTML='&bull;&bull;&bull;&bull;&bull;';
    clone.style.font=document.defaultView.getComputedStyle(document.querySelector('input[type=password]')).font;
    document.body.appendChild(clone);
    var smth=clone.clientWidth/5;
    document.body.removeChild(clone);
    bulletWidth=smth;
  };
  setTimeout(_=>{if (document.body.classList.contains('blank')) document.body.classList.remove('blank');},500); // just in case
  setTimeout(_=>{if (document.querySelector('sheepmenu').classList.contains('blockvision')) document.querySelector('sheepmenu').classList.remove('blockvision');},1000); // just in case
  if (window.location.search) {
    var redirect=window.location.search.slice(1);
    /*if (redirect.slice(0,8)=="existing") {
      window.location.hash='users';
      document.querySelector("#createform .name").value=redirect.slice(9);
      document.querySelector("#createform .error:first-of-type").innerHTML='User already exists.';
    }
    else if (redirect.slice(0,7)=="badpass") {
      window.location.hash='users';
      document.querySelector("#loginform .name").value=redirect.slice(8);
      document.querySelector("#loginform .error").innerHTML='Wrong password.';
    }
    else if (redirect.slice(0,6)=="userid") {
      window.cookie.setItem('userid',Number(redirect.slice(7)));
      window.location.search='';
    }
    else if (redirect.slice(0,6)=="signin") {
      window.location.hash='users';
    }
    else */if (redirect[0]==='.') {
      var replacers={
        j:'javascripts',
        p:'platformre',
        a:'animations',
        s:'sentence',
        h:'happynumbers',
        b:'htmlblocks',
        m:'minigames',
        w:'words-go-here',
        c:'words-go-here/misc',
        g:'gamepro5'
      };
      redirect=redirect.slice(1).replace('.','.html'),layers=[];
      for (var i=0;i<redirect.length;i++)
        if (redirect[i]!==redirect[i].toLowerCase()) {
          layers.push(redirect.slice(0,i).toLowerCase());
          redirect=redirect.slice(i);
          i=0;
        }
      layers.push(redirect.toLowerCase());
      for (var i=0;i<layers.length;i++) if (replacers[layers[i]]) {
        layers[i]=replacers[layers[i]];
      }
      window.location.replace('/'+layers.join('/'));
    }
    else window.location.replace(redirect);
  }
  if (window.location.hash) {
    if (document.querySelector(window.location.hash)) {
      document.querySelector(".active.clickable").className="clickable";
      document.querySelector(".active.page").className="page";
      document.querySelector('.clickable[data-place="'+window.location.hash.slice(1)+'"]').className+=" active";
      document.querySelector(window.location.hash).className+=" active";
    }
  }
  if (!SHEEP.dismissed.redesign) {
    SHEEP.notify('The index page has been updated!','/');
    SHEEP.dismiss('redesign');
  }
  if (!cookie.preferences) {
    cookie.preferences='{"view":"grid"}';
  }
  var preferences=JSON.parse(cookie.preferences);
  var places2go=[
    {url:'all.html',img:'img/all.png',name:'Almost Everything',featured:1},
    {url:'platformre',img:'img/plat.svg',name:'Platformre'},
    {url:'platformre/maker',img:'img/platmakre.png',name:'Level editor'},
    {url:'?penland',img:'img/penland.png',name:'Penland'},
    {url:'telegraph',img:'img/tele.png',name:'Telegraph'},
    {url:'javascripts/shepform',img:'img/colorpicker.png',name:'Color input'},
    {url:'javascripts/clicker',img:'img/click.png',name:'Clicker Game'},
    {url:'trumpdays',img:'img/trumpdays.png',name:'Trump days'},
    {url:'gamepro5/minigames/dodgedots.html',img:'img/reds.png',name:'Dodge dots game thing'},
    {url:'gamepro5/minigames/color.html',img:'img/color.png',name:'Color fight thing'},
    {url:'animations',img:'img/anima.png',name:'Animations'},
    {url:'javascripts',img:'img/js.png',name:'Javascripts'},
    {url:'sentence',img:'img/sentence.png',name:'Sentence Generator'},
    {url:'happynumbers',img:'img/mems.png',name:'Happy Number Finder'},
    {url:'javascripts/mutate.html',img:'img/life.png',name:'Cell Simulation'},
    {url:'eyo-dictionary/validator.html',img:'img/die.png',name:'Eyo Word Validator'},
    {url:'eyo-dictionary',img:'img/eyo.png',name:'Eyo Dictionary'},
    {url:'contextmenutest.html',img:'img/rightclick.png',name:'Context Menu Test'},
    {url:'blog',img:'img/blog..png',name:'Blog'},
  ];
  if (preferences.view==='grid') {
    document.querySelector('#view').innerHTML='list view';
    var inner='<a class="place" id="more"><div class="squarifier"><div></div></div><p>More links</p></a>';
    for (var i=0;i<places2go.length;i++) {
      var badge='';
      if (places2go[i].featured) badge='<span class="badge featured">featured</span>';
      else if (places2go[i].new) badge='<span class="badge new">new</span>';
      inner+='<a class="place" href="'+places2go[i].url+'"><div class="squarifier"><div></div></div><img src="'+places2go[i].img+'" alt="A picture."/>'+badge+'<p>'+places2go[i].name+'</p></a>';
    }
    document.querySelector('#places').innerHTML=inner;
  } else {
    document.querySelector('#view').innerHTML='grid view';
    var inner='<a class="placelist" id="more">More links</a>';
    for (var i=0;i<places2go.length;i++) {
      var badge='';
      if (places2go[i].featured) badge='<span class="badge featured">featured</span>';
      else if (places2go[i].new) badge='<span class="badge new">new</span>';
      inner+='<a class="placelist" href="'+places2go[i].url+'">'+badge+places2go[i].name+'</a>';
    }
    document.querySelector('#places').innerHTML=inner;
  }
  var sites;
  document.querySelector('#places').onclick=function(e){
    /*if (e.target.dataset.href) window.location.href=e.target.dataset.href;
    else if (e.target.parentNode.dataset.href) window.location.href=e.target.parentNode.dataset.href;
    else */if (e.target.id==='more'||e.target.parentNode.id==='more') {
      document.querySelector('.more').style.display='block';
      function render() {
        var el=document.querySelector('.morecontainer');
        while (el.hasChildNodes()) el.removeChild(el.lastChild);
        var s=document.createElement("span");
        s.className='closemore';
        s.innerHTML='close';
        s.onclick=e=>document.querySelector('.more').style.display='none';
        el.appendChild(s);
        for (var i=0;i<sites.length;i+=2) {
          var s=document.createElement("a");
          s.href=sites[i+1];
          s.textContent=sites[i];
          el.appendChild(s);
        }
      }
      if (!sites) SHEEP.ajax(
        'https://gist.githubusercontent.com/SheepTester/74cf1a0d5da818c4e0470a84c6c00225/raw/sites.txt',
        e=>{
          sites=e.split(/\r?\n/);
          for (var i=0;i<sites.length;i++) if (!sites[i]) sites.splice(i,1);
          render();
        }
      );
    }
  };
  document.querySelector('.more').onclick=e=>{
    if (e.target.className==='more') document.querySelector('.more').style.display='none';
  };
  document.querySelector("nav").ontouchstart=document.querySelector("nav").onclick=function(e){
    if (e.target.className=="clickable") {
      document.querySelector(".active.clickable").className="clickable";
      document.querySelector(".active.page").className="page";
      e.target.className+=" active";
      if (e.target.id=='user') {
        document.querySelector("#users").className+=" active";
        window.location.hash='users';
      } else {
        document.querySelector("#"+e.target.innerHTML).className+=" active";
        window.location.hash=e.target.innerHTML;
      }
    }
  };
  document.querySelector('#view').onclick=function(e){
    preferences.view=preferences.view==='grid'?'list':'grid';
    cookie.preferences=JSON.stringify(preferences);
    window.location.reload();
  };
  console.log(setInterval(function(){
    var age=new Date().getTime()-1049933280000;
    document.querySelector("#milliage").innerHTML=age;
    document.querySelector("#yage").innerHTML=age/31557600000;
  },200));
  console.log(setTimeout(function(){
    document.title="STOP LEAVING THIS PAGE OPEN IF YOU AREN'T GOING TO USE IT.";
  }, 60000));
  function httpGetAsync(theUrl,callback) {
    var xmlHttp=new XMLHttpRequest();
    xmlHttp.onreadystatechange=function(){
      if (xmlHttp.readyState==4&&xmlHttp.status==200) callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET",theUrl,true); // true for asynchronous
    xmlHttp.send(null);
  }
  /*var data={};
  if (window.cookie.getItem('userid')) {
    httpGetAsync('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/getstuff.php?userid='+window.cookie.getItem('userid'),function(e){
      data=JSON.parse(e);
      document.querySelector("#signedout").style.display='none';
      document.querySelector("#signedin").style.display='block';
      document.querySelector("#user").innerHTML=data.username;
    });
  } else {
    document.querySelector("#signedout").style.display='block';
    document.querySelector("#signedin").style.display='none';
    document.querySelector("#user").innerHTML='signed out';
  }
  document.querySelector('#signedout').oninput=function(e){
    function fitVal(elm) {
      var clone=document.createElement('span');
      clone.className='getTextLength';
      clone.innerHTML=elm.value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      clone.style.font=document.defaultView.getComputedStyle(elm).font;
      document.body.appendChild(clone);
      elm.style.width=(clone.offsetWidth+5)+'px';
      document.body.removeChild(clone);
    }
    if (e.target.type==='text') fitVal(e.target);
    else if (e.target.type==='password') e.target.style.width=(bulletWidth*e.target.value.length+5)+'px';

    var val=e.target.value;
    if (e.target.parentNode.id==='createform') {
      if (e.target.className==='name') {
        if (!val) {
          e.target.parentNode.querySelector(".error:first-of-type").innerHTML='You need a username.';
          e.target.parentNode.querySelector(".done").disabled=true;
        } else {
          e.target.parentNode.querySelector(".error:first-of-type").innerHTML='';
          if (!e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML) e.target.parentNode.querySelector(".done").disabled=false;
        }
      } else if (e.target.className==='pass') {
        if (val.length>4) {
          e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML='Your password is too secure. It has to be at most 4 characters long.';
          e.target.parentNode.querySelector(".done").disabled=true;
        } else if (val!=e.target.parentNode.querySelector(".pass2").value) {
          e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML='Your passwords don\'t match.';
          e.target.parentNode.querySelector(".done").disabled=true;
        } else {
          e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML='';
          if (!e.target.parentNode.querySelector(".error:first-of-type").innerHTML) e.target.parentNode.querySelector(".done").disabled=false;
        }
      } else if (e.target.className==='pass2') {
        if (val!=e.target.parentNode.querySelector(".pass").value) {
          e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML='Your passwords don\'t match.';
          e.target.parentNode.querySelector(".done").disabled=true;
        } else {
          e.target.parentNode.querySelector(".error:nth-of-type(2)").innerHTML='';
          if (!e.target.parentNode.querySelector(".error:first-of-type").innerHTML) e.target.parentNode.querySelector(".done").disabled=false;
        }
      }
    } else if (e.target.parentNode.id==='loginform') {
      //
    }
  };
  document.querySelector('#signedin button').onclick=function(){
    window.cookie.removeItem('userid');
    window.location.replace('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/signout.php');
  };*/
  document.querySelector('.menuicon').onclick=e=>{
    if (document.querySelector('nav').classList.contains('open')) document.querySelector('nav').classList.remove('open');
    else document.querySelector('nav').classList.add('open');
  };

  var bob=function(){/*use sheeptest()() to call me*/console.log('%chi bob\noh wait im bob\nnvm hi stranger','padding:5px;background:#404637;color:#9EC962;line-height:1.5;font-size:30px;font-family:sans-serif;');};
  bob.prototype={
    idk: 'i dunno',
    whatisthis: function(){return 'um, '+this.idk},
  };
  var bobrina=new bob();
  return function(){return bobrina;};
})();

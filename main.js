var sheeptest=(function(){
  if (document.querySelector('sheepmenu')) {
    document.querySelector('sheepmenu').classList.add('blockvision');
  }
  if (window.SHEEP) delete SHEEP.menu['go to index page'];
  document.body.onload=_=>{
    document.body.classList.remove('blank');
    if (document.querySelector('sheepmenu')) {
      document.querySelector('sheepmenu').classList.add('playhellos');
      setTimeout(_=>document.querySelector('sheepmenu').classList.remove('blockvision'),0);
      setTimeout(_=>document.querySelector('sheepmenu').classList.remove('playhellos'),500);
    }
  };
  setTimeout(_=>{if (document.body.classList.contains('blank')) document.body.classList.remove('blank');},500); // just in case
  setTimeout(_=>{if (document.querySelector('sheepmenu').classList.contains('blockvision')) document.querySelector('sheepmenu').classList.remove('blockvision');},1000); // just in case
  if (window.location.search) {
    var redirect=window.location.search.slice(1);
    if (redirect[0]==='.') {
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
  if (!cookie.preferences) {
    cookie.preferences='{"view":"grid"}';
  }
  var preferences=JSON.parse(cookie.preferences);
  var places2go=[
    {url:'/all/',img:'img/all2.png',name:'Almost Everything'},

    // FEATURED
    {url:'/platformre/',img:'img/plat.svg',name:'Platformre',featured:1},
    {url:'https://orbiit.github.io/gunn-web-app/',img:'img/ugwa.png',name:'Unofficial Gunn Web App'},
    {url:'/javascripts/shepform/colour.html',img:'img/colourpick.png',name:'Color input II'},

    // GAMES
    {url:'/platformre/maker/',img:'img/platmakre.png',name:'Level editor'},
    {url:'/platformre/nova/penland/',img:'img/newpenland.png',name:'Penland Nova'},
    {url:'/gamepro5/minigames/turkeys/',img:'img/turkeys.png',name:'Turkeys'},
    {url:'/telegraph/',img:'img/tele.png',name:'Telegraph'},
    {url:'/javascripts/clicker',img:'img/click.png',name:'Clicker Game'},
    {url:'/gamepro5/minigames/dodgedots.html',img:'img/reds.png',name:'Dodge dots game thing'},
    {url:'/gamepro5/minigames/color.html',img:'img/color.png',name:'Color fight thing'},
    {url:'https://orbiit.github.io/gunn-web-app/games/connect4.html',img:'img/connect4.png',name:'Connect 3'},
    {url:'/gunn-student-sim/',img:'img/gunn%20student%20simulator.png',name:'Gunn student simulator',new:1},
    {url:'/fun-gunn-run/',img:'img/fgr.png',name:'"Fun" Gunn Run',new:1},

    // DIRECTORIES
    {url:'/javascripts/',img:'img/js.png',name:'Javascripts'},
    {url:'/words-go-here/misc/',img:'img/misc.png',name:'Miscellaneous'},
    {url:'/thingkingland/sitemap.html',img:'img/thingkingland.png',name:'Thingkingland'},
    {url:'/javascripts/particles/',img:'img/particles.png',name:'Particles'},
    {url:'/hello-world/',img:'img/helloworlddir.png',name:'Chromebook creations'},

    // OTHER THINGS
    {url:'/trumpdays/',img:'img/trumpdays.png',name:'Trump days'},
    {url:'/roots/',img:'img/roots.png',name:'Roots and Affixes'},
    {url:'/happynumbers/',img:'img/mems.png',name:'Happy Number Finder'},
    {url:'/happynumbers/sieve/',img:'img/sieve.png',name:'Sieve of Eranthoses'},
    {url:'/animations/',img:'img/anima.png',name:'Animations'},
    {url:'/sentence/',img:'img/sentence.png',name:'Sentence Generator'},
    {url:'/contextmenutest.html',img:'img/rightclick.png',name:'Context Menu Test'},
    {url:'/longer-tweets/',img:'img/longtweets.png',name:'Longer Tweets'}, // hiddenish
    {url:'/themes/billy-goat/index-dark.html',img:'img/billy-goat.png',name:'Billy Goat Blog Theme'},
    {url:'/javascripts/carecalc.html',img:'img/carecalc.png',name:'Grade Care Calculator'},

    // CONFUSING THINGS
    {url:'/olamreee/',img:'img/olamreee.png',name:'OlamREEE'},
    {url:'/javascripts/imagetoscheme.html',img:'img/scheme.png',name:'Image to ASCII'},
    {url:'/javascripts/terminal/',img:'img/terminal.png',name:'Terminal'},
    {url:'?penland',img:'img/penland.png',name:'Penland'},
    {url:'/javascripts/mutate.html',img:'img/life.png',name:'Cell Simulation'},
    {url:'/eyo-dictionary/',img:'img/eyo.png',name:'Eyo Dictionary'},
    {url:'/eyo-dictionary/validator.html',img:'img/die.png',name:'Eyo Word Validator'}
  ];
  if (preferences.view==='grid') {
    document.querySelector('#view').innerHTML='list view';
    var inner='';
    for (var i=0;i<places2go.length;i++) {
      var badge='';
      if (places2go[i].featured) badge='<span class="badge featured">featured</span>';
      else if (places2go[i].new) badge='<span class="badge new">new</span>';
      inner+='<a class="place" href="'+places2go[i].url+'"><div class="squarifier"><div></div></div><img src="'+places2go[i].img+'" alt="A picture."/>'+badge+'<p>'+places2go[i].name+'</p></a>';
    }
    document.querySelector('#places').innerHTML=inner;
  } else {
    document.querySelector('#view').innerHTML='grid view';
    var inner='';
    for (var i=0;i<places2go.length;i++) {
      var badge='';
      if (places2go[i].featured) badge='<span class="badge featured">featured</span>';
      else if (places2go[i].new) badge='<span class="badge new">new</span>';
      inner+='<a class="placelist" href="'+places2go[i].url+'">'+badge+places2go[i].name+'</a>';
    }
    document.querySelector('#places').innerHTML=inner;
  }
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
  function displayAge() {
    var age=new Date().getTime()-1049933280000;
    document.querySelector("#milliage").innerHTML=age;
    document.querySelector("#yage").innerHTML=age/31557600000;
    setTimeout(displayAge,200);
  }
  displayAge();
  function zalgify(text,intensity) {
    // characters from http://www.eeemo.net/
    let upperDiacritics=['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307','\u0308','\u030a','\u0342','\u0343','\u0344','\u034a','\u034b','\u034c','\u0303','\u0302','\u030c','\u0350','\u0300','\u0301','\u030b','\u030f','\u0312','\u0313','\u0314','\u033d','\u0309','\u0363','\u0364','\u0365','\u0366','\u0367','\u0368','\u0369','\u036a','\u036b','\u036c','\u036d','\u036e','\u036f','\u033e','\u035b','\u0346','\u031a'],
    lowerDiacritics=['\u0316','\u0317','\u0318','\u0319','\u031c','\u031d','\u031e','\u031f','\u0320','\u0324','\u0325','\u0326','\u0329','\u032a','\u032b','\u032c','\u032d','\u032e','\u032f','\u0330','\u0331','\u0332','\u0333','\u0339','\u033a','\u033b','\u033c','\u0345','\u0347','\u0348','\u0349','\u034d','\u034e','\u0353','\u0354','\u0355','\u0356','\u0359','\u035a','\u0323'],
    midDiacritics=['\u0315','\u031b','\u0340','\u0341','\u0358','\u0321','\u0322','\u0327','\u0328','\u0334','\u0335','\u0336','\u034f','\u035c','\u035d','\u035e','\u035f','\u0360','\u0362','\u0338','\u0337','\u0361','\u0489'],
    output='',
    i=text.length;
    while (i--) {
      let newChar=text[i];
      if (intensity<1) {
        if (Math.floor(Math.random()*1/intensity)===0) newChar+=upperDiacritics[Math.floor(Math.random()*upperDiacritics.length)];
        if (Math.floor(Math.random()*1/intensity)===0) newChar+=lowerDiacritics[Math.floor(Math.random()*lowerDiacritics.length)];
      } else {
        let midDiacriticsCopy=midDiacritics.join(',').split(',');
        for (let j=0;j<intensity;j++) newChar+=upperDiacritics[Math.floor(Math.random()*upperDiacritics.length)]+lowerDiacritics[Math.floor(Math.random()*lowerDiacritics.length)];
        for (let j=0;j<intensity/4&&j<midDiacritics.length;j++) newChar+=midDiacriticsCopy.splice(Math.floor(Math.random()*midDiacriticsCopy.length),1);
      }
      output=newChar+output;
    }
    return output;
  }
  setTimeout(function(){
    var intensity=0;
    function zalgoTitle() {
      if (intensity<30) ++intensity;
      document.title=zalgify('SheepTester',intensity/10);
      setTimeout(zalgoTitle,500);
    }
    zalgoTitle();
  },60000);
  function httpGetAsync(theUrl,callback) {
    var xmlHttp=new XMLHttpRequest();
    xmlHttp.onreadystatechange=function(){
      if (xmlHttp.readyState==4&&xmlHttp.status==200) callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET",theUrl,true); // true for asynchronous
    xmlHttp.send(null);
  }
  document.querySelector('.menuicon').onclick=e=>{
    if (document.querySelector('nav').classList.contains('open')) document.querySelector('nav').classList.remove('open');
    else document.querySelector('nav').classList.add('open');
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  var bob=function(){/*use sheeptest()() to call me*/console.log('%chi bob\noh wait im bob\nnvm hi stranger','padding:5px;background:#404637;color:#9EC962;line-height:1.5;font-size:30px;font-family:sans-serif;');};
  bob.prototype={
    idk: 'i dunno',
    whatisthis: function(){return 'um, '+this.idk},
  };
  var bobrina=new bob();
  return function(){return bobrina;};
})();

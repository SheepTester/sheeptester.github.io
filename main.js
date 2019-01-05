try {window.sheeptest=(function(){
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
  document.querySelector('.clickable[href="#places"]').className += ' active';
  (window.onhashchange = () => {
    document.querySelector(".active.clickable").className="clickable";
    if (window.location.hash && document.querySelector(window.location.hash)) {
      // document.querySelector(".active.page").className="page";
      document.querySelector('.clickable[href="#'+window.location.hash.slice(1)+'"]').className+=" active";
      // document.querySelector(window.location.hash).className+=" active";
    } else {
      document.querySelector('.clickable[href="#places"]').className += ' active';
    }
  })();
  if (!cookie.preferences) {
    cookie.preferences='{"view":"grid"}';
  }
  var preferences=JSON.parse(cookie.preferences);
  if (preferences.view==='grid') {
    document.querySelector('#view').innerHTML='list view';
    document.body.classList.remove('list-view');
    Array.from(document.getElementsByClassName('placelist')).forEach(link => {
      link.innerHTML = `<div class="squarifier"><div></div></div><img src="${link.dataset.image}" alt="A picture."/>` + link.innerHTML;
      link.className = 'place';
    });
  } else {
    document.querySelector('#view').innerHTML='grid view';
  }
  document.querySelector("nav").ontouchstart=document.querySelector("nav").onclick=function(e){
    if (e.target.className=="clickable") {
      document.querySelector(".active.clickable").className="clickable";
      // document.querySelector(".active.page").className="page";
      e.target.className+=" active";
      // document.querySelector("#"+e.target.innerHTML).className+=" active";
      window.location.hash=e.target.innerHTML;
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
    document.querySelector("#yage").innerHTML=(age/31557600000).toString().padEnd(18, '0');
    window.requestAnimationFrame(displayAge);
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
  let tabFocus = false;
  document.addEventListener('keydown', e => {
    if (e.keyCode === 9) {
      document.body.classList.add('tabkeyfocus');
      tabFocus = true;
    } else if (e.target.tagName === 'SPAN' && e.keyCode === 13) {
      e.target.click();
    }
  });
  document.addEventListener('keyup', e => {
    if (e.keyCode === 9) {
      tabFocus = false;
    }
  });
  document.addEventListener('focusin', e => {
    if (!tabFocus) {
      document.body.classList.remove('tabkeyfocus');
    }
  });

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
})();} catch (e) {
  const error = document.getElementById('error');
  error.textContent = e && e.stack;
  error.style.display = 'block';
}

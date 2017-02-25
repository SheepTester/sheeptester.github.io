(function() {
  var elements=['water','fire','metal','wood','earth'],clicks=0,clicktimeout;
  try {
    if (localStorage.elements) elements=JSON.parse(localStorage.elements);
    else save();
  } catch (e) {}
  function update(list) {
    document.querySelector('#ess').innerHTML=elements.length;
    while (list.hasChildNodes()) list.removeChild(list.lastChild);
    for (var i=0;i<elements.length;i++) {
      var s=document.createElement('element');
      s.style.backgroundColor='#'+colours[categories[elements[i]]];
      s.innerHTML=elements[i];
      var av=0;
      if (combos[elements[i]]) for (var j=0;j<combos[elements[i]].length;j++) {
        if (!elements.includes(combos[elements[i]][j])&&elements.includes(combofriend[elements[i]][j])) av++;
      }
      s.dataset.category=categories[elements[i]];
      s.dataset.available=av;
      switch (document.querySelector('select').value) {
        case 'young':
          list.insertBefore(s,list.firstChild);
          break;
        case 'old':
          list.appendChild(s);
          break;
        case 'cat':
          var t=list.querySelector('element[data-category="'+categories[elements[i]]+'"]');
          if (t) list.insertBefore(s,t.nextSibling);
          else list.appendChild(s);
          break;
        case 'av':
          var t=list.children,j;
          for (j=t.length-1;j>=0;j--) {
            if (Number(t[j].dataset.available)>av) {
              list.insertBefore(s,t[j].nextSibling);
              break;
            }
          }
          if (j===-1) list.insertBefore(s,list.firstChild);
          break;
        default:
          list.appendChild(s);
      }
    }
  }
  save=_=>localStorage.elements=JSON.stringify(elements);
  update(document.querySelector('#one'));
  document.querySelector('#one').onclick=e=>{
    if (e.target.tagName==='ELEMENT') {
      var self=false;
      if (e.target.classList.contains('active')) self=true;
      else e.target.classList.add('active');
      // mix?
      if (document.querySelectorAll('list .active').length===2||self) {
        var mix1=document.querySelectorAll('#one .active')[0].innerHTML,
        mix2=self?mix1:document.querySelectorAll('#one .active')[1].innerHTML;
        if (recipies[mix1+'_'+mix2]) {
          var s=document.createElement('entry');
          if (!elements.includes(recipies[mix1+'_'+mix2])) {
            elements.push(recipies[mix1+'_'+mix2]);
            s.innerHTML='New element! ';
            var sound=new Audio('ding.mp3');
            sound.play();
            save();
          } else {
            var sound=new Audio('note.mp3');
            sound.play();
          }
          s.innerHTML+='You just made '+recipies[mix1+'_'+mix2]+'.';
          document.querySelector('log').insertBefore(s,document.querySelector('log').firstChild);
          setTimeout(_=>document.querySelector('log').removeChild(s),2500);
        }
        else if (recipies[mix2+'_'+mix1]) {
          var s=document.createElement('entry');
          if (!elements.includes(recipies[mix2+'_'+mix1])) {
            elements.push(recipies[mix2+'_'+mix1]);
            s.innerHTML='New element! ';
            var sound=new Audio('ding.mp3');
            sound.play();
            save();
          } else {
            var sound=new Audio('note.mp3');
            sound.play();
          }
          s.innerHTML+='You just made '+recipies[mix2+'_'+mix1]+'.';
          document.querySelector('log').insertBefore(s,document.querySelector('log').firstChild);
          setTimeout(_=>document.querySelector('log').removeChild(s),2500);
        }
        else {
          var s=document.createElement('entry');
          s.innerHTML='That doesn\'t make anything.';
          document.querySelector('log').insertBefore(s,document.querySelector('log').firstChild);
          setTimeout(_=>document.querySelector('log').removeChild(s),2500);
          var sound=new Audio('wood%20block.wav');
          sound.play();
        }
        update(document.querySelector('#one'));
      }
    }
  };
  document.querySelector('select').onchange=e=>{
    update(document.querySelector('#one'));
  };
  document.querySelector('btn').onclick=e=>{
    clicks++;
    console.log(clicks);
    if (clicks>9) {
      localStorage.removeItem('elements');
      window.location.reload();
    }
    clearTimeout(clicktimeout);
    clicktimeout=setTimeout(_=>clicks=0,1000);
  };
}());

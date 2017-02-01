(_=>{
	var s=document.querySelectorAll('a');
  for (var i=0;i<s.length;i++) if (!s[i].href) s[i].href='http://'+s[i].textContent;
  s=document.querySelectorAll('cap');
  for (var i=0;i<s.length;i++) if (!s[i].innerHTML) {
    s[i].innerHTML=s[i].previousSibling.previousSibling.getAttribute('title'); // pS gets whitespace nodes too
    s[i].style.width=s[i].previousSibling.previousSibling.offsetWidth+'px'
  }
  document.querySelector('menuicon').onclick=e=>{
    if (document.querySelector('nav').classList.contains('open')) document.querySelector('nav').classList.remove('open');
    else document.querySelector('nav').classList.add('open');
  };
  var h2scrolls=[];
  (function(){
    var h2s=document.querySelectorAll('h2');
    for (var i=0;i<h2s.length;i++) h2scrolls.push(h2s[i].offsetTop-10);
  })();
  window.onresize=e=>{
    console.log('resized');
    var h2s=document.querySelectorAll('h2');
    h2scrolls=[];
    for (var i=0;i<h2s.length;i++) h2scrolls.push(h2s[i].offsetTop-10);
    var s=document.querySelectorAll('cap');
    for (var i=0;i<s.length;i++) s[i].style.width=s[i].previousSibling.previousSibling.offsetWidth+'px'
  };
  window.onscroll=e=>{
    var activeH2,
    scroll=document.body.scrollTop;
    if (document.querySelector('nav a.active'))
      activeH2=document.querySelector(document.querySelector('nav a.active').getAttribute('href'));
    for (var i=h2scrolls.length-1;i>=0;i--) {
      if (scroll>=h2scrolls[i]) {
        i++;
        if (!activeH2) {
          document.querySelector('nav a:nth-of-type('+i+')').classList.add('active');
        } else if (activeH2!=document.querySelector('h2:nth-of-type('+i+')')) {
          document.querySelector('nav a.active').classList.remove('active');
          document.querySelector('nav a:nth-of-type('+i+')').classList.add('active');
        }
        document.body.className=document.querySelector('nav a.active').dataset.color;
        break;
      } else if (i===0) {
        if (document.querySelector('nav a.active')) document.querySelector('nav a.active').classList.remove('active');
        document.body.className='';
      }
    }
  };
  window.onresize();
  window.onscroll();
})();

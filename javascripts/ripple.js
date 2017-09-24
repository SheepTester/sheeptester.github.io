// stolen from UGWA (Orbiit/gunn-web-app)
function ripple(elem) {
  elem.style.overflow="hidden";
  if (!/fixed|absolute|relative/.test(window.getComputedStyle(elem).position)) elem.style.position='relative';
  function mousedown(x,y) {
    var r=document.createElement("div"),
    rect=elem.getBoundingClientRect();
    r.classList.add('ripple');
    if (elem.classList.contains('ripple-light')) r.classList.add('ripple-light');
    if (elem.classList.contains('ripple-dark')) r.classList.add('ripple-dark');
    r.style.left=(x-rect.left)+'px';
    r.style.top=(y-rect.top)+'px';
    elem.appendChild(r);
    var start=new Date().getTime(),
    dest=Math.max(rect.width,rect.height)/10,
    duration=dest*31,
    fade=false,fadestart;
    function updateScale() {
      var elapsed=(new Date().getTime()-start)/duration,
      fadeelapsed=(new Date().getTime()-fadestart)/500;
      if (fade&&fadeelapsed>1) {
        elem.removeChild(r);
        r=null;
      } else {
        r.style.transform=`scale(${elapsed*dest})`;
        if (fadeelapsed) r.style.opacity=1-fadeelapsed;
        else r.style.opacity=1;
        window.requestAnimationFrame(updateScale);
      }
    }
    function mouseup(e) {
      fade=true,fadestart=new Date().getTime();
      document.removeEventListener('mouseup',mouseup,false);
      document.removeEventListener('touchend',mouseup,false);
      if (e.type==="touchend") lasttap=fadestart;
    }
    window.requestAnimationFrame(updateScale);
    document.addEventListener('mouseup',mouseup,false);
    document.addEventListener('touchend',mouseup,false);
  }
  var lasttap=0;
  elem.addEventListener("mousedown",e=>{
    if (new Date().getTime()-lasttap>100) mousedown(e.clientX,e.clientY);
  },false);
  elem.addEventListener("touchstart",e=>{
    mousedown(e.touches[0].clientX,e.touches[0].clientY);
  },false);
}
window.addEventListener("load",e=>{
  for (var t of document.querySelectorAll('button.material')) ripple(t);
},false);

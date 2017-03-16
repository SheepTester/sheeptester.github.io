var events='focus blur click resize scroll cut copy paste keydown keyup keypress mouseenter mouseover mousemove mousedown mouseup dblclick contextmenu wheel mouseleave mouseout select dragstart drag dragend dragenter dragover dragleave drop fullscreenchange beforeprint afterprint pagehide pageshow popstate cached unload beforeunload load online offline open close touchstart touchmove touchend'.split(' '),
statinner='<button id="hide">Hide stats</button><br>';
for (var i=0;i<events.length;i++) {
  statinner+=events[i]+': <span id="stat'+events[i]+'">0</span><br>'
  document.addEventListener(events[i],(e)=>{
    document.querySelector('#stat'+e.type).innerHTML=Number(document.querySelector('#stat'+e.type).innerHTML)+1;
    if (!'mousemove drag dragover touchmove'.split(' ').includes(e.type)) {
      var s=document.createElement('li');
      s.innerHTML=e.type;
      setTimeout(()=>{
        s.className='bye';
        setTimeout(()=>{
          document.querySelector('#events').removeChild(s);
        },500);
      },3000);
      document.querySelector('#events').appendChild(s);
    }
  });
}
statinner+='<strong>Not all events are listed here</strong>'
document.querySelector('#stats').innerHTML=statinner;
document.querySelector('#show').onclick=function(){
  document.querySelector('#show').style.display='none';
  document.querySelector('#stats').style.display='block';
};
document.querySelector('#hide').onclick=function(){
  document.querySelector('#show').style.display='block';
  document.querySelector('#stats').style.display='none';
};

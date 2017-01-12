document.querySelector('#stage').width=480*2;
document.querySelector('#stage').height=360*2;
var gl,
inits={
  canvas:document.querySelector('#stage'),
  gl:function(canvas){
    // get context whatever that means
    try {
      gl=canvas.getContext('webgl')||canvas.getContext("experimental-webgl");
      gl.viewportWidth=canvas.width;
      gl.viewportHeight=canvas.height;
    } catch (e) {}
    if (!gl) alert('your browser is no fun');
  },
  shader:function(){
    //
  },
};
function init() {
  document.querySelector('#choose').style.display='block';
  document.querySelector('#choose').onclick=function(e){
    if (e.target.tagName==='LI') {
      window.location.search=SHEEP.search({js:e.target.dataset.js});
      // window.location.reload();
    }
  };
}
if (window.location.search) {
  let s=document.createElement('script');
  s.src=SHEEP.search(window.location.search).js+'.js';
  document.body.appendChild(s);
}

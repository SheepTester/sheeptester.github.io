window.addEventListener("DOMContentLoaded",e=>{
  function resize() {
    var canvases=document.querySelectorAll('body>canvas');
    for (var i=0;i<canvases.length;i++) {
      var canvas=canvases[i],
      c=canvas.getContext('2d'),
      pixelratio=(window.devicePixelRatio||1)/(c.webkitBackingStorePixelRatio||c.mozBackingStorePixelRatio||c.msBackingStorePixelRatio||c.oBackingStorePixelRatio||c.backingStorePixelRatio||1);
      canvas.width=pixelratio*window.innerWidth;
      canvas.height=pixelratio*window.innerHeight;
      c.scale(pixelratio,pixelratio);
      if (canvas.classList.contains('pixelated')) {
        c.imageSmoothingEnabled=false;
        c.mozImageSmoothingEnabled=false;
        c.webkitImageSmoothingEnabled=false;
      }
    }
  }
  window.addEventListener("resize",resize,false);
  resize();
},false);

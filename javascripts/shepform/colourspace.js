function ColourInput(elem,options) {
  options=options||{};
  options.selectorSize=options.selectorSize||256;
  this.parent=elem;
  var pixelratio=(()=>{
    var ctx=document.createElement("canvas").getContext("2d"),
    dpr=window.devicePixelRatio||1,
    bsr=ctx.webkitBackingStorePixelRatio||
      ctx.mozBackingStorePixelRatio||
      ctx.msBackingStorePixelRatio||
      ctx.oBackingStorePixelRatio||
      ctx.backingStorePixelRatio||1;
    return dpr/bsr;
  })(),
  data={
    R:{x:'B',y:'G',range:256,offset:0,group:'RGB',name:'r'},
    G:{x:'B',y:'R',range:256,offset:0,group:'RGB',name:'g'},
    B:{x:'G',y:'R',range:256,offset:0,group:'RGB',name:'b'},
    H:{x:'S',y:'V',range:360,offset:0,group:'HSV',name:'h'},
    S:{x:'H',y:'V',range:100,offset:0,group:'HSV',name:'s'},
    V:{x:'H',y:'S',range:100,offset:0,group:'HSV',name:'v'},
    h:{x:'s',y:'l',range:360,offset:0,group:'HSL',name:'h'},
    s:{x:'h',y:'l',range:100,offset:0,group:'HSL',name:'s'},
    l:{x:'h',y:'s',range:100,offset:0,group:'HSL',name:'l'},
    L:{x:'a',y:'b',range:100,offset:0,group:'Lab',name:'L'},
    a:{x:'b',y:'L',range:256,offset:-127,group:'Lab',name:'a'},
    b:{x:'a',y:'L',range:256,offset:-127,group:'Lab',name:'b'},
    c:{x:'y',y:'m',range:256,offset:0,group:'CMY',name:'c'},
    m:{x:'y',y:'c',range:256,offset:0,group:'CMY',name:'m'},
    y:{x:'m',y:'c',range:256,offset:0,group:'CMY',name:'y'},
  };
  if (options.defaultRGB) this.colour=ColourInput.convert.smallRGB(options.defaultRGB.r,options.defaultRGB.g,options.defaultRGB.b);
  else this.colour=ColourInput.convert.hextoRGBA('009688');
  this.colour=ColourInput.convert.smallRGB(this.colour.r,this.colour.g,this.colour.b);
  this.square=document.createElement("canvas");
  this.square.width=options.selectorSize*pixelratio;
  this.square.height=options.selectorSize*pixelratio;
  var mouse=e=>{
    var sliderOnMove=ev=>{
      var e;
      if (ev.touches) e=ev.touches[0];
      else e=ev;
      var x=(e.clientX-this.square.getBoundingClientRect().left+1)/this.square.offsetWidth,
      y=(this.square.offsetHeight-e.clientY+this.square.getBoundingClientRect().top-1)/this.square.offsetHeight;
      x=x*data[data[slider].x].range;
      y=y*data[data[slider].y].range;
      if (x<0) x=0;
      else if (x>=data[data[slider].x].range) x=data[data[slider].x].range-1;
      if (y<0) y=0;
      else if (y>=data[data[slider].y].range) y=data[data[slider].y].range-1;
      var converted=data[slider].group==='RGB'?ColourInput.convert.bigRGB(this.colour):ColourInput.convert['RGBto'+data[slider].group](this.colour);
      converted[data[data[slider].x].name]=x+data[data[slider].x].offset;
      converted[data[data[slider].y].name]=y+data[data[slider].y].offset;
      this.colour=data[slider].group==='RGB'?ColourInput.convert.smallRGB(converted.r,converted.g,converted.b):ColourInput.convert[data[slider].group+'toRGB'](converted);
      this.render(data[slider].group==='Lab');
      ev.preventDefault();
      return false;
    },
    sliderUp=e=>{
      document.removeEventListener("mousemove",sliderOnMove,false);
      document.removeEventListener("mouseup",sliderUp,false);
      document.removeEventListener("touchmove",sliderOnMove,{passive:false});
      document.removeEventListener("touchend",sliderUp,{passive:false});
      this.render();
    },
    slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for;
    document.addEventListener("mousemove",sliderOnMove,false);
    document.addEventListener("mouseup",sliderUp,false);
    document.addEventListener("touchmove",sliderOnMove,{passive:false});
    document.addEventListener("touchend",sliderUp,{passive:false});
    sliderOnMove(e);
  };
  this.square.addEventListener("mousedown",mouse,false);
  this.square.addEventListener("touchstart",mouse,false);
  this.parent.appendChild(this.square);
  this.line=document.createElement("canvas");
  this.line.width=pixelratio;
  this.line.height=options.selectorSize*pixelratio;
  mouse=e=>{
    var sliderOnMove=ev=>{
      var e;
      if (ev.touches) e=ev.touches[0];
      else e=ev;
      var y=(this.line.offsetHeight-e.clientY+this.line.getBoundingClientRect().top-1)/this.line.offsetHeight;
      y=y*data[slider].range;
      if (y<0) y=0;
      else if (y>=data[slider].range) y=data[slider].range-1;
      var converted=data[slider].group==='RGB'?ColourInput.convert.bigRGB(this.colour):ColourInput.convert['RGBto'+data[slider].group](this.colour);
      converted[data[slider].name]=y+data[slider].offset;
      this.colour=data[slider].group==='RGB'?ColourInput.convert.smallRGB(converted.r,converted.g,converted.b):ColourInput.convert[data[slider].group+'toRGB'](converted);
      this.render(true);
      ev.preventDefault();
      return false;
    },
    sliderUp=e=>{
      document.removeEventListener("mousemove",sliderOnMove,false);
      document.removeEventListener("mouseup",sliderUp,false);
      document.removeEventListener("touchmove",sliderOnMove,{passive:false});
      document.removeEventListener("touchend",sliderUp,{passive:false});
      this.render();
    },
    slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for;
    document.addEventListener("mousemove",sliderOnMove,false);
    document.addEventListener("mouseup",sliderUp,false);
    document.addEventListener("touchmove",sliderOnMove,{passive:false});
    document.addEventListener("touchend",sliderUp,{passive:false});
    sliderOnMove(e);
  };
  this.line.addEventListener("mousedown",mouse,false);
  this.line.addEventListener("touchstart",mouse,false);
  this.parent.appendChild(this.line);
  var inputsCanRenderToo=e=>this.render(),
  inputsCanSeeColoursToo=_=>this.colour,
  inputsCanChangeColoursToo=set=>this.colour=set;
  function Input(parent,name,min,max,radio,allowNegative) {
    radio=radio||false;
    allowNegative=allowNegative||false;
    if (radio) {
      this.radio=document.createElement("input");
      this.radio.type='radio';
      this.radio.name='slider';
      this.radio.dataset.for=name;
      this.radio.addEventListener("focus",e=>this.input.focus(),false);
      this.radio.addEventListener("click",e=>{
        lastcolour={};
        inputsCanRenderToo();
      },false);
      parent.appendChild(this.radio);
    }
    this.label=document.createElement("label");
    this.label.textContent=name;
    this.label.setAttribute('for',name);
    parent.appendChild(this.label);
    this.input=document.createElement("input");
    this.input.type='text';
    this.input.name=name;
    this.input.addEventListener("keydown",e=>{
      this.input.selectionStart=this.input.selectionEnd=10000;
      var t=false;
      if (e.keyCode>48&&e.keyCode<58||e.keyCode===48&&this.input.value!=='-') {
        if (Number(this.input.value+(e.keyCode-48))>=min&&Number(this.input.value+(e.keyCode-48))<=max) {
          t=true;
          if (this.input.value==='0') this.input.value='';
        }
      }
      else if (e.keyCode===8||e.keyCode===9) t=true;
      else if (allowNegative&&(e.keyCode===109||e.keyCode===189)&&!this.input.value) t=true;
      if (!t) {
        e.preventDefault();
        return false;
      }
    },false);
    this.input.addEventListener("mousedown",e=>{
      setTimeout(_=>this.input.selectionStart=this.input.selectionEnd=10000,0);
    },false);
    this.input.addEventListener("blur",e=>{
      if (this.input.value==='-'||!this.input.value) this.input.value=0;
    },false);
    this.input.addEventListener("paste",e=>{
      e.preventDefault();
      return false;
    },false);
    this.input.addEventListener("change",e=>{
      var dat=data[this.input.name];
      if (dat) {
        var converted=dat.group==='RGB'?ColourInput.convert.bigRGB(inputsCanSeeColoursToo()):ColourInput.convert['RGBto'+dat.group](inputsCanSeeColoursToo());
        converted[dat.name]=this.input.value==='-'||!this.input.value?0:Number(this.input.value);
        inputsCanChangeColoursToo(dat.group==='RGB'?ColourInput.convert.smallRGB(converted.r,converted.g,converted.b):ColourInput.convert[dat.group+'toRGB'](converted));
        inputsCanRenderToo();
      }
    },false);
    parent.appendChild(this.input);
  }
  function boringInput(parent) {
    this.input=document.createElement("input");
    this.input.type='text';
    this.input.name=name;
    parent.appendChild(this.input);
  }
  this.preview=document.createElement("colour-preview");
  this.preview.style.backgroundImage='linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%,#eee 100%),linear-gradient(45deg,#eee 25%,white 25%,white 75%,#eee 75%,#eee 100%)';
  this.preview.style.backgroundPosition='0px 0px,10px 10px';
  this.preview.style.backgroundSize='20px 20px';
  this.colourpreview=document.createElement("colour-preview");
  this.preview.appendChild(this.colourpreview);
  this.parent.appendChild(this.preview);
  this.htmlcolours=document.createElement("ul");
  for (var span in ColourInput.html) {
    var s=document.createElement("li");
    s.textContent=span;
    s.style.backgroundColor=span;
    var c=ColourInput.html[span],inverted=ColourInput.convert.bigRGB(ColourInput.convert.invertRGB(ColourInput.convert.smallRGB(c.r,c.g,c.b)));
    inverted.r+=((inverted.a<180)*2-1)*50;
    inverted.g+=((inverted.g<150)*2-1)*50;
    inverted.b+=((inverted.b<206)*2-1)*50;
    s.style.color=`rgb(${inverted.r},${inverted.g},${inverted.b})`;
    this.htmlcolours.appendChild(s);
  }
  this.htmlcolours.addEventListener("click",e=>{
    if (e.target.tagName==='LI') {
      var c=ColourInput.html[e.target.textContent];
      this.colour=ColourInput.convert.smallRGB(c.r,c.g,c.b);
      this.render();
    }
  },false);
  this.parent.appendChild(this.htmlcolours);
  this.materials=document.createElement("table");
  for (var span in ColourInput.material) {
    var s=document.createElement("tr");
    for (var i in ColourInput.material[span]) {
      var t=document.createElement("td");
      t.style.backgroundColor='#'+ColourInput.material[span][i];
      if (i==='500') t.textContent=span;
      else t.textContent=i;
      s.appendChild(t);
    }
    this.materials.appendChild(s);
  }
  this.materials.addEventListener("click",e=>{
    if (e.target.tagName==='TD') {
      var c;
      if (ColourInput.material[e.target.textContent]) c=ColourInput.material[e.target.textContent][500];
      else c=ColourInput.material[e.target.parentNode.children[5].textContent][e.target.textContent];
      c=ColourInput.convert.hextoRGBA(c);
      this.colour=ColourInput.convert.smallRGB(c.r,c.g,c.b);
      this.render();
    }
  },false);
  this.parent.appendChild(this.materials);
  this.hex=new boringInput(this.parent);
  this.hex.input.addEventListener("change",e=>{
    var hex=this.hex.input.value.replace(/[^1234567890abcdef]/gi,'').toLowerCase();
    if (hex.length<5) {
      var t='';
      for (var i=0;i<hex.length;i++) t+=hex[i]+hex[i];
      hex=t;
    }
    if (hex.length===8) {
      var alpha=parseInt(hex.slice(6),16)*100/255;
      this.alpharange.value=alpha;
      this.alpha.input.value=alpha;
      hex=hex.slice(0,6);
    } else {
      this.alpharange.value=100;
      this.alpha.input.value=100;
    }
    hex=ColourInput.convert.hextoRGBA(hex);
    this.colour=ColourInput.convert.smallRGB(hex.r,hex.g,hex.b);
    this.render();
  },false);
  this.rgb=new boringInput(this.parent);
  this.rgb.input.addEventListener("change",e=>{
    var rgb=this.rgb.input.value.split(/[^\d.]/).filter(a=>a).map(a=>Number(a));
    if (rgb.length>3) {
      this.alpharange.value=rgb[3]*100;
      this.alpha.input.value=rgb[3]*100;
    } else {
      this.alpharange.value=100;
      this.alpha.input.value=100;
    }
    this.colour=ColourInput.convert.smallRGB(rgb[0],rgb[1],rgb[2]);
    this.render();
  },false);
  this.hsl=new boringInput(this.parent);
  this.hsl.input.addEventListener("change",e=>{
    var hsl=this.hsl.input.value.split(/[^\d.]/).filter(a=>a).map(a=>Number(a));
    if (hsl.length>3) {
      this.alpharange.value=hsl[3]*100;
      this.alpha.input.value=hsl[3]*100;
    } else {
      this.alpharange.value=100;
      this.alpha.input.value=100;
    }
    hsl=ColourInput.convert.HSLtoRGB({h:hsl[0],s:hsl[1],l:hsl[2]});
    this.colour=ColourInput.convert.smallRGB(hsl.r,hsl.g,hsl.b);
    this.render();
  },false);
  this.alpharange=document.createElement("input");
  this.alpharange.type='range';
  this.alpharange.min=0;
  this.alpharange.max=100;
  this.alpharange.step=1;
  this.alpharange.value=100;
  this.alpharange.addEventListener("input",e=>{
    this.alpha.input.value=this.alpharange.value;
    this.render();
  },false);
  this.alpharange.addEventListener("focus",e=>{
    this.alpha.input.focus();
  },false);
  this.parent.appendChild(this.alpharange);
  this.alpha=new Input(this.parent,'alpha',0,100);
  this.alpha.input.value=100;
  this.alpha.input.addEventListener("change",e=>{
    this.alpharange.value=this.alpha.input.value;
    this.render();
  },false);
  this.R=new Input(this.parent,'R',0,255,1);
  this.G=new Input(this.parent,'G',0,255,1);
  this.B=new Input(this.parent,'B',0,255,1);
  this.H=new Input(this.parent,'H',0,360,1);
  this.S=new Input(this.parent,'S',0,100,1);
  this.V=new Input(this.parent,'V',0,100,1);
  this.h=new Input(this.parent,'h',0,360,1);
  this.s=new Input(this.parent,'s',0,100,1);
  this.l=new Input(this.parent,'l',0,100,1);
  this.L=new Input(this.parent,'L',0,100,1);
  this.a=new Input(this.parent,'a',-128,127,1,1);
  this.b=new Input(this.parent,'b',-128,127,1,1);
  this.c=new Input(this.parent,'c',0,255,1);
  this.m=new Input(this.parent,'m',0,255,1);
  this.y=new Input(this.parent,'y',0,255,1);
  this.K=new Input(this.parent,'K',0,100);
  this.C=new Input(this.parent,'C',0,100);
  this.M=new Input(this.parent,'M',0,100);
  this.Y=new Input(this.parent,'Y',0,100);
  this.R.radio.checked=true;
  var lastcolour={},truelastcolour={};
  this.render=quick=>{
    quick=quick||false;
    var alpha=this.alpha.input.value/100,
    t=ColourInput.convert.bigRGB(this.colour);
    this.R.input.value=t.r;
    this.G.input.value=t.g;
    this.B.input.value=t.b;
    this.rgb.input.value=`rgb${alpha!==1?'a':''}(${t.r},${t.g},${t.b}${alpha!==1?','+alpha:''})`;
    t=ColourInput.convert.RGBtoHSV(this.colour);
    this.H.input.value=t.h;
    this.S.input.value=t.s;
    this.V.input.value=t.v;
    t=ColourInput.convert.RGBtoHSL(this.colour);
    this.h.input.value=t.h;
    this.s.input.value=t.s;
    this.l.input.value=t.l;
    this.hsl.input.value=`hsl${alpha!==1?'a':''}(${t.h},${t.s}%,${t.l}%${alpha!==1?','+alpha:''})`;
    t=ColourInput.convert.RGBtoLab(this.colour);
    this.L.input.value=t.L;
    this.a.input.value=t.a;
    this.b.input.value=t.b;
    t=ColourInput.convert.RGBtoCMY(this.colour);
    this.c.input.value=t.c;
    this.m.input.value=t.m;
    this.y.input.value=t.y;
    t=ColourInput.convert.RGBtoCMYK(this.colour);
    this.K.input.value=t.k;
    this.C.input.value=t.c;
    this.M.input.value=t.m;
    this.Y.input.value=t.y;
    this.hex.input.value='#'+ColourInput.convert.RGBAtohex(this.colour)+(alpha<1?('0'+Math.floor(alpha*255.99).toString(16)).slice(-2):'');
    this.colourpreview.style.backgroundColor=this.rgb.input.value;
    if (options.onchange&&(truelastcolour.r!==this.colour.r||truelastcolour.g!==this.colour.g||truelastcolour.b!==this.colour.b||truelastcolour.a!==alpha)) {
      var t=ColourInput.convert.bigRGB(this.colour);
      t.a=alpha;
      options.onchange(t);
    }
    truelastcolour={r:this.colour.r,g:this.colour.g,b:this.colour.b,a:alpha}
    if (lastcolour.quick!==quick||lastcolour.r!==this.colour.r||lastcolour.g!==this.colour.g||lastcolour.b!==this.colour.b) {
      var c=this.square.getContext('2d'),
      slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for,
      inverted=ColourInput.convert.bigRGB(ColourInput.convert.invertRGB(this.colour)),
      converted;
      inverted.r+=((inverted.a<180)*2-1)*50;
      inverted.g+=((inverted.g<150)*2-1)*50;
      inverted.b+=((inverted.b<206)*2-1)*50;
      this.line.width=this.line.width;
      function pixel(x,y,rgba,quick) {
        c.fillStyle=`rgb${rgba.a!==undefined?'a':''}(${rgba.r},${rgba.g},${rgba.b}${rgba.a!==undefined?','+rgba.a:''})`;
        if (quick) c.fillRect(x,y,5.5,5.5);
        else c.fillRect(x,y,1.5,1.5);
      }
      converted=data[slider].group==='RGB'?ColourInput.convert.bigRGB(this.colour):ColourInput.convert['RGBto'+data[slider].group](this.colour);
      if (lastcolour.slider===converted[data[slider].name]&&lastcolour.quick===quick) {
        for (var x=lastcolour.sliderx-3-data[data[slider].x].offset;x<=lastcolour.sliderx+3-data[data[slider].x].offset;x++)
          for (var y=lastcolour.slidery-3-data[data[slider].y].offset;y<=lastcolour.slidery+3-data[data[slider].y].offset;y++) {
            var t=Object.assign({},converted);
            t[data[data[slider].x].name]=x+data[data[slider].x].offset;
            t[data[data[slider].y].name]=y+data[data[slider].y].offset;
            pixel(
              x,
              y,
              data[slider].group==='RGB'?t:ColourInput.convert.bigRGB(ColourInput.convert[data[slider].group+'toRGB'](t))
            );
          }
      } else {
        this.square.width=this.square.width;
        c.translate(0,this.square.height);
        c.scale(pixelratio*options.selectorSize/data[data[slider].x].range,-pixelratio*options.selectorSize/data[data[slider].y].range);
        for (var x=0;x<data[data[slider].x].range;quick?x+=5:x++)
          for (var y=0;y<data[data[slider].y].range;quick?y+=5:y++) {
            var t=Object.assign({},converted);
            t[data[data[slider].x].name]=x+data[data[slider].x].offset;
            t[data[data[slider].y].name]=y+data[data[slider].y].offset;
            pixel(
              x,
              y,
              data[slider].group==='RGB'?t:ColourInput.convert.bigRGB(ColourInput.convert[data[slider].group+'toRGB'](t)),
              quick
            );
          }
      }
      c.beginPath();
      c.arc(converted[data[data[slider].x].name]-data[data[slider].x].offset,converted[data[data[slider].y].name]-data[data[slider].y].offset,2,0,2*Math.PI);
      c.strokeStyle=`rgb(${inverted.r},${inverted.g},${inverted.b})`;
      c.lineWidth=1;
      c.stroke();
      c=this.line.getContext('2d');
      c.translate(0,this.line.height);
      c.scale(pixelratio,-pixelratio*options.selectorSize/data[slider].range);
      for (var y=0;y<data[slider].range;y++) {
        var t=Object.assign({},converted);
        t[data[slider].name]=y+data[slider].offset;
        pixel(
          0,
          y,
          data[slider].group==='RGB'?t:ColourInput.convert.bigRGB(ColourInput.convert[data[slider].group+'toRGB'](t)));
      }
      pixel(0,converted[data[slider].name]-data[slider].offset,inverted);
      lastcolour=Object.assign({},this.colour);
      lastcolour.slider=converted[data[slider].name];
      lastcolour.sliderx=converted[data[data[slider].x].name];
      lastcolour.slidery=converted[data[data[slider].y].name];
      lastcolour.quick=quick;
    }
  };
  this.render();
}
/* rgb values from 0-1 (divided by 255)
   all code stolen from https://scratch.mit.edu/projects/116343198/ */
ColourInput.convert={
  invertRGB:rgb=>({r:1-rgb.r,g:1-rgb.g,b:1-rgb.b}),
  bigRGB:rgb=>({r:Math.floor(rgb.r*255.999999),g:Math.floor(rgb.g*255.999999),b:Math.floor(rgb.b*255.999999)}),
  smallRGB:(r,g,b)=>({r:r/255,g:g/255,b:b/255}),
  RGBtoHSV(rgb) {
    var r=rgb.r,
    g=rgb.g,
    b=rgb.b,
    min,max;
    if (r<g) min=r,max=g;
    else min=g,max=r;
    if (b<min) min=b;
    else if (b>max) max=b;
    var hsv={v:Math.round(max*100)},
    delta=max-min;
    if (delta===0) return {v:hsv.v,s:0,h:0};
    if (max>0) hsv.s=Math.round(delta/max*100);
    else return {v:hsv.v,s:0,h:0};
    if (r===max) hsv.h=Math.round((g-b)/delta*60);
    else if (g===max) hsv.h=Math.round(120+(b-r)/delta*60);
    else hsv.h=Math.round(240+(r-g)/delta*60);
    if (hsv.h<0) hsv.h+=360;
    return hsv;
  },
  HSVtoRGB(hsv) {
    var h=hsv.h,
    s=hsv.s,
    v=hsv.v,
    hh=Math.floor(h/60.0001),
    f=h/60-hh,
    p=v*(100-s)/10000,
    q=v/100*(1-f*(s/100)),
    t=v/100*(1-(1-f)*(s/100)),
    rgb;
    if (hh<4) {
      if (hh<2) {
        if (hh<1) rgb={r:v/100,g:t,b:p};
        else rgb={r:q,g:v/100,b:p};
      } else if (hh<3) rgb={r:p,g:v/100,b:t};
      else rgb={r:p,g:q,b:v/100};
    } else if (hh<5) rgb={r:t,g:p,b:v/100};
    else rgb={r:v/100,g:p,b:q};
    return rgb;
  },
  RGBtoLab(rgb) {
    var r=rgb.r,
    g=rgb.g,
    b=rgb.b,
    linear={};
    if (r>0.040449936) linear.r=Math.pow((r+0.055)/1.055,2.4);
    else linear.r=r/12.92;
    if (g>0.040449936) linear.g=Math.pow((g+0.055)/1.055,2.4);
    else linear.g=r/12.92;
    if (b>0.040449936) linear.b=Math.pow((b+0.055)/1.055,2.4);
    else linear.b=r/12.92;
    var x=linear.r*(10135552/23359437)+linear.g*(8788810/23359437)+linear.b*(4435075/23359437),
    y=linear.r*(871024/4096299)+linear.g*(8788810/12288897)+linear.b*(887015/12288897),
    z=linear.r*(158368/8920923)+linear.g*(8788810/80288307)+linear.b*(70074185/80288307);
    if (x>216/24389) x=Math.pow(x,1/3);
    else x=x*(841/108)+4/29;
    if (y>216/24389) y=Math.pow(y,1/3);
    else y=y*(841/108)+4/29;
    if (z>216/24389) z=Math.pow(z,1/3);
    else z=z*(841/108)+4/29;
    return {L:Math.round(y*116-16),a:Math.round((x-y)*500),b:Math.round((y-z)*200)};
  },
  LabtoRGB(Lab) {
    var L=Lab.L,
    a=Lab.a,
    b=Lab.b,
    y=(L+16)/116,
    x=a/500+y,
    z=b/-200+y;
    if (x>6/29) x=x*x*x;
    else x=x*(108/841)-432/24389;
    if (L>6/29) y=y*y*y;
    else y=L*(27/24389);
    if (z>6/29) z=z*z*z;
    else z=z*(108/841)-432/24389;
    var linear={
      r:x*(1219569/395920)+y*(-608687/395920)+z*(-107481/197960),
      g:x*(-80960619/87888100)+y*(82435961/43944050)+z*(3976797/87888100),
      b:x*(93813/1774030)+y*(-180961/887015)+z*(107481/93370)
    },rgb={};
    if (linear.r>0.0031308) rgb.r=Math.pow(linear.r,1/2.4)*1.055-0.055;
    else rgb.r=linear.r*12.92;
    if (linear.g>0.0031308) rgb.g=Math.pow(linear.g,1/2.4)*1.055-0.055;
    else rgb.g=linear.g*12.92;
    if (linear.b>0.0031308) rgb.b=Math.pow(linear.b,1/2.4)*1.055-0.055;
    else rgb.b=linear.b*12.92;
    if (rgb.r<0) rgb.r=0
    else if (rgb.r>1) rgb.r=1;
    if (rgb.g<0) rgb.g=0
    else if (rgb.g>1) rgb.g=1;
    if (rgb.b<0) rgb.b=0
    else if (rgb.b>1) rgb.b=1;
    return rgb;
  },
  RGBtoCMYK(rgb) {
    var r=rgb.r,
    g=rgb.g,
    b=rgb.b,
    max;
    max=r>g?r:g;
    if (b>max) max=b;
    if (max===0) return {k:100,c:0,m:0,y:0};
    else return {k:Math.round((1-max)*100),c:Math.round((max-r)/max*100),m:Math.round((max-g)/max*100),y:Math.round((max-b)/max*100)};
  },
  CMYKtoRGB:cmyk=>({r:(100-cymk.c)*(100-cymk.k)/10000,g:(100-cymk.m)*(100-cymk.k)/10000,b:(100-cymk.y)*(100-cymk.k)/10000}),
  RGBtoCMY:rgb=>({c:Math.floor((1-rgb.r)*255.99999),m:Math.floor((1-rgb.g)*255.99999),y:Math.floor((1-rgb.b)*255.99999)}),
  CMYtoRGB:cmy=>({r:(255-cmy.c)/255,g:(255-cmy.m)/255,b:(255-cmy.y)/255}),
  RGBAtodec:rgba=>16777216*Math.floor(255.9999*rgba.a)+65536*Math.floor(255.9999*rgba.r)+256*Math.floor(255.9999*rgba.g)+Math.floor(255.9999*rgba.b),
  dectoRGBA:dec=>({r:Math.floor(dec/65536),g:Math.floor(dec/256)%256,b:dec%256,a:Math.floor(dec/16777216)/255||1}),
  RGBAtohex:rgba=>(rgba.a!==undefined&&rgba.a<1?(rgba.a>0?('00'+Math.floor(rgba.a*255.99).toString(16)).slice(-2):'01'):'')+('00'+Math.floor(rgba.r*255.9999).toString(16)).slice(-2)+('00'+Math.floor(rgba.g*255.9999).toString(16)).slice(-2)+('00'+Math.floor(rgba.b*255.9999).toString(16)).slice(-2),
  hextoRGBA:hex=>ColourInput.convert.dectoRGBA(parseInt(hex,16)),
  RGBtoHSL(rgb) {
    var max=Math.max(rgb.r,rgb.g,rgb.b),min=Math.min(rgb.r,rgb.g,rgb.b);
    var h,s,l=(max+min)/2;
    if (max===min) h=s=0;
    else {
      var d=max-min;
      s=l>0.5?d/(2-max-min):d/(max+min);
      switch (max) {
        case rgb.r: h=(rgb.g-rgb.b)/d+(rgb.g<rgb.b?6:0); break;
        case rgb.g: h=(rgb.b-rgb.r)/d+2; break;
        case rgb.b: h=(rgb.r-rgb.g)/d+4; break;
      }
      h/=6;
    }
    return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
  },
  HSLtoRGB(hsl) {
    var r,g,b;
    hsl={h:hsl.h/360,s:hsl.s/100,l:hsl.l/100};
    if (hsl.s===0) r=g=b=hsl.l;
    else {
      var hue2rgb=(p,q,t)=>{
        if (t<0) t+=1;
        if (t>1) t-=1;
        if (t<1/6) return p+(q-p)*6*t;
        if (t<1/2) return q;
        if (t<2/3) return p+(q-p)*(2/3-t)*6;
        return p;
      };
      var q=hsl.l<0.5?hsl.l*(1+hsl.s):hsl.l+hsl.s-hsl.l*hsl.s,
      p=2*hsl.l-q;
      r=hue2rgb(p,q,hsl.h+1/3);
      g=hue2rgb(p,q,hsl.h);
      b=hue2rgb(p,q,hsl.h-1/3);
    }
    return {r:r,g:g,b:b};
  }
};
ColourInput.html={"indianred":{r:205,g:92,b:92},"lightcoral":{r:240,g:128,b:128},"salmon":{r:250,g:128,b:114},"darksalmon":{r:233,g:150,b:122},"lightsalmon":{r:255,g:160,b:122},"crimson":{r:220,g:20,b:60},"red":{r:255,g:0,b:0},"firebrick":{r:178,g:34,b:34},"darkred":{r:139,g:0,b:0},"pink":{r:255,g:192,b:203},"lightpink":{r:255,g:182,b:193},"hotpink":{r:255,g:105,b:180},"deeppink":{r:255,g:20,b:147},"mediumvioletred":{r:199,g:21,b:133},"palevioletred":{r:219,g:112,b:147},"coral":{r:255,g:127,b:80},"tomato":{r:255,g:99,b:71},"orangered":{r:255,g:69,b:0},"darkorange":{r:255,g:140,b:0},"orange":{r:255,g:165,b:0},"gold":{r:255,g:215,b:0},"yellow":{r:255,g:255,b:0},"lightyellow":{r:255,g:255,b:224},"lemonchiffon":{r:255,g:250,b:205},"lightgoldenrodyellow":{r:250,g:250,b:210},"papayawhip":{r:255,g:239,b:213},"moccasin":{r:255,g:228,b:181},"peachpuff":{r:255,g:218,b:185},"palegoldenrod":{r:238,g:232,b:170},"khaki":{r:240,g:230,b:140},"darkkhaki":{r:189,g:183,b:107},"lavender":{r:230,g:230,b:250},"thistle":{r:216,g:191,b:216},"plum":{r:221,g:160,b:221},"violet":{r:238,g:130,b:238},"orchid":{r:218,g:112,b:214},"fuchsia":{r:255,g:0,b:255},"magenta":{r:255,g:0,b:255},"mediumorchid":{r:186,g:85,b:211},"mediumpurple":{r:147,g:112,b:219},"rebeccapurple":{r:102,g:51,b:153},"blueviolet":{r:138,g:43,b:226},"darkviolet":{r:148,g:0,b:211},"darkorchid":{r:153,g:50,b:204},"darkmagenta":{r:139,g:0,b:139},"purple":{r:128,g:0,b:128},"indigo":{r:75,g:0,b:130},"slateblue":{r:106,g:90,b:205},"darkslateblue":{r:72,g:61,b:139},"mediumslateblue":{r:123,g:104,b:238},"greenyellow":{r:173,g:255,b:47},"chartreuse":{r:127,g:255,b:0},"lawngreen":{r:124,g:252,b:0},"lime":{r:0,g:255,b:0},"limegreen":{r:50,g:205,b:50},"palegreen":{r:152,g:251,b:152},"lightgreen":{r:144,g:238,b:144},"mediumspringgreen":{r:0,g:250,b:154},"springgreen":{r:0,g:255,b:127},"mediumseagreen":{r:60,g:179,b:113},"seagreen":{r:46,g:139,b:87},"forestgreen":{r:34,g:139,b:34},"green":{r:0,g:128,b:0},"darkgreen":{r:0,g:100,b:0},"yellowgreen":{r:154,g:205,b:50},"olivedrab":{r:107,g:142,b:35},"olive":{r:128,g:128,b:0},"darkolivegreen":{r:85,g:107,b:47},"mediumaquamarine":{r:102,g:205,b:170},"darkseagreen":{r:143,g:188,b:139},"lightseagreen":{r:32,g:178,b:170},"darkcyan":{r:0,g:139,b:139},"teal":{r:0,g:128,b:128},"aqua":{r:0,g:255,b:255},"cyan":{r:0,g:255,b:255},"lightcyan":{r:224,g:255,b:255},"paleturquoise":{r:175,g:238,b:238},"aquamarine":{r:127,g:255,b:212},"turquoise":{r:64,g:224,b:208},"mediumturquoise":{r:72,g:209,b:204},"darkturquoise":{r:0,g:206,b:209},"cadetblue":{r:95,g:158,b:160},"steelblue":{r:70,g:130,b:180},"lightsteelblue":{r:176,g:196,b:222},"powderblue":{r:176,g:224,b:230},"lightblue":{r:173,g:216,b:230},"skyblue":{r:135,g:206,b:235},"lightskyblue":{r:135,g:206,b:250},"deepskyblue":{r:0,g:191,b:255},"dodgerblue":{r:30,g:144,b:255},"cornflowerblue":{r:100,g:149,b:237},"royalblue":{r:65,g:105,b:225},"blue":{r:0,g:0,b:255},"mediumblue":{r:0,g:0,b:205},"darkblue":{r:0,g:0,b:139},"navy":{r:0,g:0,b:128},"midnightblue":{r:25,g:25,b:112},"cornsilk":{r:255,g:248,b:220},"blanchedalmond":{r:255,g:235,b:205},"bisque":{r:255,g:228,b:196},"navajowhite":{r:255,g:222,b:173},"wheat":{r:245,g:222,b:179},"burlywood":{r:222,g:184,b:135},"tan":{r:210,g:180,b:140},"rosybrown":{r:188,g:143,b:143},"sandybrown":{r:244,g:164,b:96},"goldenrod":{r:218,g:165,b:32},"darkgoldenrod":{r:184,g:134,b:11},"peru":{r:205,g:133,b:63},"chocolate":{r:210,g:105,b:30},"saddlebrown":{r:139,g:69,b:19},"sienna":{r:160,g:82,b:45},"brown":{r:165,g:42,b:42},"maroon":{r:128,g:0,b:0},"white":{r:255,g:255,b:255},"snow":{r:255,g:250,b:250},"honeydew":{r:240,g:255,b:240},"mintcream":{r:245,g:255,b:250},"azure":{r:240,g:255,b:255},"aliceblue":{r:240,g:248,b:255},"ghostwhite":{r:248,g:248,b:255},"whitesmoke":{r:245,g:245,b:245},"seashell":{r:255,g:245,b:238},"beige":{r:245,g:245,b:220},"oldlace":{r:253,g:245,b:230},"floralwhite":{r:255,g:250,b:240},"ivory":{r:255,g:255,b:240},"antiquewhite":{r:250,g:235,b:215},"linen":{r:250,g:240,b:230},"lavenderblush":{r:255,g:240,b:245},"mistyrose":{r:255,g:228,b:225},"gainsboro":{r:220,g:220,b:220},"lightgray":{r:211,g:211,b:211},"silver":{r:192,g:192,b:192},"darkgray":{r:169,g:169,b:169},"gray":{r:128,g:128,b:128},"dimgray":{r:105,g:105,b:105},"lightslategray":{r:119,g:136,b:153},"slategray":{r:112,g:128,b:144},"darkslategray":{r:47,g:79,b:79},"black":{r:0,g:0,b:0}};
ColourInput.material={"Red":{"50":"FFEBEE","100":"FFCDD2","200":"EF9A9A","300":"E57373","400":"EF5350","500":"F44336","600":"E53935","700":"D32F2F","800":"C62828","900":"B71C1C","A100":"FF8A80","A200":"FF5252","A400":"FF1744","A700":"D50000"},"Pink":{"50":"FCE4EC","100":"F8BBD0","200":"F48FB1","300":"F06292","400":"EC407A","500":"E91E63","600":"D81B60","700":"C2185B","800":"AD1457","900":"880E4F","A100":"FF80AB","A200":"FF4081","A400":"F50057","A700":"C51162"},"Purple":{"50":"F3E5F5","100":"E1BEE7","200":"CE93D8","300":"BA68C8","400":"AB47BC","500":"9C27B0","600":"8E24AA","700":"7B1FA2","800":"6A1B9A","900":"4A148C","A100":"EA80FC","A200":"E040FB","A400":"D500F9","A700":"AA00FF"},"Deep Purple":{"50":"EDE7F6","100":"D1C4E9","200":"B39DDB","300":"9575CD","400":"7E57C2","500":"673AB7","600":"5E35B1","700":"512DA8","800":"4527A0","900":"311B92","A100":"B388FF","A200":"7C4DFF","A400":"651FFF","A700":"6200EA"},"Indigo":{"50":"E8EAF6","100":"C5CAE9","200":"9FA8DA","300":"7986CB","400":"5C6BC0","500":"3F51B5","600":"3949AB","700":"303F9F","800":"283593","900":"1A237E","A100":"8C9EFF","A200":"536DFE","A400":"3D5AFE","A700":"304FFE"},"Blue":{"50":"E3F2FD","100":"BBDEFB","200":"90CAF9","300":"64B5F6","400":"42A5F5","500":"2196F3","600":"1E88E5","700":"1976D2","800":"1565C0","900":"0D47A1","A100":"82B1FF","A200":"448AFF","A400":"2979FF","A700":"2962FF"},"Light Blue":{"50":"E1F5FE","100":"B3E5FC","200":"81D4FA","300":"4FC3F7","400":"29B6F6","500":"03A9F4","600":"039BE5","700":"0288D1","800":"0277BD","900":"01579B","A100":"80D8FF","A200":"40C4FF","A400":"00B0FF","A700":"0091EA"},"Cyan":{"50":"E0F7FA","100":"B2EBF2","200":"80DEEA","300":"4DD0E1","400":"26C6DA","500":"00BCD4","600":"00ACC1","700":"0097A7","800":"00838F","900":"006064","A100":"84FFFF","A200":"18FFFF","A400":"00E5FF","A700":"00B8D4"},"Teal":{"50":"E0F2F1","100":"B2DFDB","200":"80CBC4","300":"4DB6AC","400":"26A69A","500":"009688","600":"00897B","700":"00796B","800":"00695C","900":"004D40","A100":"A7FFEB","A200":"64FFDA","A400":"1DE9B6","A700":"00BFA5"},"Green":{"50":"E8F5E9","100":"C8E6C9","200":"A5D6A7","300":"81C784","400":"66BB6A","500":"4CAF50","600":"43A047","700":"388E3C","800":"2E7D32","900":"1B5E20","A100":"B9F6CA","A200":"69F0AE","A400":"00E676","A700":"00C853"},"Light Green":{"50":"F1F8E9","100":"DCEDC8","200":"C5E1A5","300":"AED581","400":"9CCC65","500":"8BC34A","600":"7CB342","700":"689F38","800":"558B2F","900":"33691E","A100":"CCFF90","A200":"B2FF59","A400":"76FF03","A700":"64DD17"},"Lime":{"50":"F9FBE7","100":"F0F4C3","200":"E6EE9C","300":"DCE775","400":"D4E157","500":"CDDC39","600":"C0CA33","700":"AFB42B","800":"9E9D24","900":"827717","A100":"F4FF81","A200":"EEFF41","A400":"C6FF00","A700":"AEEA00"},"Yellow":{"50":"FFFDE7","100":"FFF9C4","200":"FFF59D","300":"FFF176","400":"FFEE58","500":"FFEB3B","600":"FDD835","700":"FBC02D","800":"F9A825","900":"F57F17","A100":"FFFF8D","A200":"FFFF00","A400":"FFEA00","A700":"FFD600"},"Amber":{"50":"FFF8E1","100":"FFECB3","200":"FFE082","300":"FFD54F","400":"FFCA28","500":"FFC107","600":"FFB300","700":"FFA000","800":"FF8F00","900":"FF6F00","A100":"FFE57F","A200":"FFD740","A400":"FFC400","A700":"FFAB00"},"Orange":{"50":"FFF3E0","100":"FFE0B2","200":"FFCC80","300":"FFB74D","400":"FFA726","500":"FF9800","600":"FB8C00","700":"F57C00","800":"EF6C00","900":"E65100","A100":"FFD180","A200":"FFAB40","A400":"FF9100","A700":"FF6D00"},"Deep Orange":{"50":"FBE9E7","100":"FFCCBC","200":"FFAB91","300":"FF8A65","400":"FF7043","500":"FF5722","600":"F4511E","700":"E64A19","800":"D84315","900":"BF360C","A100":"FF9E80","A200":"FF6E40","A400":"FF3D00","A700":"DD2C00"},"Brown":{"50":"EFEBE9","100":"D7CCC8","200":"BCAAA4","300":"A1887F","400":"8D6E63","500":"795548","600":"6D4C41","700":"5D4037","800":"4E342E","900":"3E2723"},"Grey":{"50":"FAFAFA","100":"F5F5F5","200":"EEEEEE","300":"E0E0E0","400":"BDBDBD","500":"9E9E9E","600":"757575","700":"616161","800":"424242","900":"212121"},"Blue Grey":{"50":"ECEFF1","100":"CFD8DC","200":"B0BEC5","300":"90A4AE","400":"78909C","500":"607D8B","600":"546E7A","700":"455A64","800":"37474F","900":"263238"}};

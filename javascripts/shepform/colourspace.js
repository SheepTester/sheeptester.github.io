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
  this.colour=options.defaultRGB||ColourInput.convert.hextoRGBA('009688');
  this.colour=ColourInput.convert.smallRGB(this.colour.r,this.colour.g,this.colour.b);
  this.square=document.createElement("canvas");
  this.square.width=options.selectorSize*pixelratio;
  this.square.height=options.selectorSize*pixelratio;
  this.square.addEventListener("mousedown",e=>{
    var sliderOnMove=e=>{
      var x=(e.clientX-this.square.offsetLeft)/this.square.offsetWidth,
      y=(this.square.offsetHeight-e.clientY+this.square.offsetTop)/this.square.offsetHeight;
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
      this.render(true);
      e.preventDefault();
      return false;
    },
    sliderUp=e=>{
      document.removeEventListener("mousemove",sliderOnMove,false);
      document.removeEventListener("mouseup",sliderUp,false);
      this.render();
    },
    slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for;
    document.addEventListener("mousemove",sliderOnMove,false);
    document.addEventListener("mouseup",sliderUp,false);
    sliderOnMove(e);
  },false);
  this.parent.appendChild(this.square);
  this.line=document.createElement("canvas");
  this.line.width=pixelratio;
  this.line.height=options.selectorSize*pixelratio;
  this.line.addEventListener("mousedown",e=>{
    var sliderOnMove=e=>{
      var y=(this.line.offsetHeight-e.clientY+this.line.offsetTop)/this.line.offsetHeight;
      y=y*data[slider].range;
      if (y<0) y=0;
      else if (y>=data[slider].range) y=data[slider].range-1;
      var converted=data[slider].group==='RGB'?ColourInput.convert.bigRGB(this.colour):ColourInput.convert['RGBto'+data[slider].group](this.colour);
      converted[data[slider].name]=y+data[slider].offset;
      this.colour=data[slider].group==='RGB'?ColourInput.convert.smallRGB(converted.r,converted.g,converted.b):ColourInput.convert[data[slider].group+'toRGB'](converted);
      this.render(true);
      e.preventDefault();
      return false;
    },
    sliderUp=e=>{
      document.removeEventListener("mousemove",sliderOnMove,false);
      document.removeEventListener("mouseup",sliderUp,false);
      this.render();
    },
    slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for;
    document.addEventListener("mousemove",sliderOnMove,false);
    document.addEventListener("mouseup",sliderUp,false);
    sliderOnMove(e);
  },false);
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
      this.radio.addEventListener("click",inputsCanRenderToo,false);
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
  this.parent.appendChild(this.preview);
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
  var lastcolour={};
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
    if (lastcolour.r!==this.colour.r||lastcolour.g!==this.colour.g||lastcolour.b!==this.colour.b) {
      this.preview.style.backgroundColor=this.rgb.input.value;
      var c=this.square.getContext('2d'),
      slider=this.parent.querySelector('input[name="slider"]:checked').dataset.for,
      inverted=ColourInput.convert.bigRGB(ColourInput.convert.invertRGB(this.colour)),
      converted;
      this.square.width=this.square.width;
      this.line.width=this.line.width;
      function pixel(x,y,rgba,quick) {
        c.fillStyle=`rgb${rgba.a!==undefined?'a':''}(${rgba.r},${rgba.g},${rgba.b}${rgba.a!==undefined?','+rgba.a:''})`;
        if (quick) c.fillRect(x,y,5.5,5.5);
        else c.fillRect(x,y,1.5,1.5);
      }
      c.translate(0,this.square.height);
      c.scale(pixelratio*options.selectorSize/data[data[slider].x].range,-pixelratio*options.selectorSize/data[data[slider].y].range);
      converted=data[slider].group==='RGB'?ColourInput.convert.bigRGB(this.colour):ColourInput.convert['RGBto'+data[slider].group](this.colour);
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
      c.beginPath();
      c.arc(converted[data[data[slider].x].name]-data[data[slider].x].offset,converted[data[data[slider].y].name]-data[data[slider].y].offset,2,0,2*Math.PI);
      c.strokeStyle=`rgb(${inverted.r},${inverted.g},${inverted.b})`;
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
      if (!quick) lastcolour=Object.assign({},this.colour);
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

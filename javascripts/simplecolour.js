var simpleConvert={
  HSVtoRGB(h,s,v) {
    /* h 0-359 sv 0-100; rgb 0-255 */
    var r,g,b,i,f,p,q,t;
    h/=360,s/=100,v/=100,
    i=Math.floor(h*6),
    f=h*6-i,
    p=v*(1-s),
    q=v*(1-f*s),
    t=v*(1-(1-f)*s);
    switch (i%6) {
      case 0:r=v,g=t,b=p;break;
      case 1:r=q,g=v,b=p;break;
      case 2:r=p,g=v,b=t;break;
      case 3:r=p,g=q,b=v;break;
      case 4:r=t,g=p,b=v;break;
      case 5:r=v,g=p,b=q;break;
    }
    return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];
  },
  RGBtoHEX(r,g,b) {
    /* rgb 0-255; hex 0-ffffff */
    return ('0'+r.toString(16)).slice(-2)+('0'+g.toString(16)).slice(-2)+('0'+b.toString(16)).slice(-2);
  },
  RGBtoHSV(r,g,b) {
    /* rgb 0-255; h 0-359 sv 0-100 */
    var max=Math.max(r,g,b),min=Math.min(r,g,b),
      d=max-min,
      h,
      s=(max===0?0:d/max),
      v=max/255;
    switch (max) {
      case min:h=0;break;
      case r:h=(g-b)+d*(g<b?6:0);h/=6*d;break;
      case g:h=(b-r)+d*2;h/=6*d;break;
      case b:h=(r-g)+d*4;h/=6*d;break;
    }
    return [Math.round(h*360),Math.round(s*100),Math.round(v*100)];
  },
  SVtoSL(s,v) {
    /* sv 0-100; sl 0-100 */
    s/=100,v/=100;
    var _l=(2-s)*v;
    _l=[Math.round((s*v)/(_l<=1?_l:2-_l)*100),Math.round(_l*50)];
    if (isNaN(_l[0])) _l[0]=0;
    return _l;
  },
  SLtoSV(s,l) {
    /* sl 0-100; sv 0-100 */
    l/=50,s/=100;
    s*=(l<=1)?l:2-l;
    return [Math.round((2*s)/(l+s)*100),Math.round((l+s)*50)];
  }
};
class ColourPicker {
  constructor(radio) {
    this.radio=radio;
    this.radio.checked=true;
    this.radio.type='radio';
    ColourPicker.applyStyles(this.radio,{
      webkitAppearance:'none',
      WebkitAppearance:'none',
      MozAppearance:'none',
      appearance:'none',
      verticalAlign:'top',
      cursor:'pointer'
    });
    this.wrapper=document.createElement("div");
    this.wrapper.classList.add('simplecolourwrapper');
    this.hex=document.createElement("input");
    this.hex.classList.add('simplecolourhex');
    this.wrapper.appendChild(this.hex);
    this.square=document.createElement("div");
    this.square.classList.add('simplecoloursquare');
    ColourPicker.applyStyles(this.square,{
      backgroundImage:'linear-gradient(0deg,black,transparent),linear-gradient(90deg,white,transparent)',
      backgroundColor:'red',
      position:'relative',
      cursor:'crosshair'
    });
    this.squaredot=document.createElement("div");
    this.squaredot.classList.add('simplecoloursquareknob');
    ColourPicker.applyStyles(this.squaredot,{
      position:'absolute'
    });
    this.square.appendChild(this.squaredot);
    this.wrapper.appendChild(this.square);
    this.hue=document.createElement("div");
    this.hue.classList.add('simplecolourhue');
    ColourPicker.applyStyles(this.hue,{
      backgroundImage:'linear-gradient(180deg,red,yellow,lime,cyan,blue,magenta,red)',
      position:'relative',
      cursor:'crosshair'
    });
    this.huebar=document.createElement("div");
    this.huebar.classList.add('simplecolourhueknob');
    ColourPicker.applyStyles(this.huebar,{
      position:'absolute'
    });
    this.hue.appendChild(this.huebar);
    this.wrapper.appendChild(this.hue);
    this.radio.parentNode.insertBefore(this.wrapper,this.radio.nextSibling);
    this.radio.addEventListener("focus",e=>{
      this.wrapper.classList.add('active');
      var pos=this.radio.getBoundingClientRect();
      if (pos.left+this.wrapper.offsetWidth>window.innerWidth) this.wrapper.style.left=pos.left-this.wrapper.offsetWidth+pos.width+'px';
      else this.wrapper.style.left=pos.left+'px';
      if (pos.top+this.wrapper.offsetHeight>window.innerHeight) this.wrapper.style.top=(pos.top-this.wrapper.offsetHeight-2)+'px';
      else this.wrapper.style.top=(pos.top+pos.height+2)+'px';
    },false);
    this.radio.addEventListener("blur",e=>{
      this.wrapper.classList.remove('active');
    },false);
    this.hex.addEventListener("focus",e=>{
      this.wrapper.classList.add('active');
    },false);
    this.hex.addEventListener("blur",e=>{
      this.wrapper.classList.remove('active');
    },false);
    this.hex.addEventListener("change",e=>{
      var val=this.hex.value,t,pos;
      if (val.slice(0,3)==='rgb') this.hsv=simpleConvert.RGBtoHSV(...val.slice(val.indexOf('(')+1,-1).split(',').map(a=>+a));
      else if (val.slice(0,3)==='hsl') {
        t=val.slice(val.indexOf('(')+1,-1).split(',').map(a=>+a.replace(/%/g,''));
        this.hsv=[t[0],...simpleConvert.SLtoSV(...t.slice(1))];
      }
      if (val[0]==='#'&&val.length===4) val=val.slice(1);
      if (val.length===3) val=val[0]+val[0]+val[1]+val[1]+val[2]+val[2];
      if (val[0]==='#'&&val.length===7||val.length===6) {
        if (val[0]==='#') val=val.slice(1);
        t=this.hsv.slice();
        this.hsv=simpleConvert.RGBtoHSV(...val.toLowerCase().match(/.{2}/g).map(a=>parseInt(a,16)));
        if (!(this.hsv[0]>=0&&this.hsv[0]<360&&this.hsv[1]>=0&&this.hsv[1]<=100&&this.hsv[2]>=0&&this.hsv[2]<=100)) this.hsv=t;
      }
      this.update();
    },false);
    this.hsv=[0,0,100];
    (this.update=()=>{
      var t,pos;
      this.wrapper.style.transform="initial";
      this.colour=this.hex.value=this.radio.value=this.radio.style.backgroundColor='#'+simpleConvert.RGBtoHEX(...simpleConvert.HSVtoRGB(...this.hsv));
      this.radio.style.boxShadow=`inset 0 0 0 100vw ${this.colour}`;
      this.square.style.backgroundColor=`hsl(${this.hsv[0]},100%,50%)`;
      t=simpleConvert.SVtoSL(...this.hsv.slice(1)),t=`,${t[0]}%,${t[1]}%`;
      this.hue.style.backgroundImage=`linear-gradient(180deg,hsl(0${t}),hsl(60${t}),hsl(120${t}),hsl(180${t}),hsl(240${t}),hsl(300${t}),hsl(0${t}))`;
      pos=this.square.getBoundingClientRect();
      this.squaredot.style.left=(this.hsv[1]/100*pos.width)+'px';
      this.squaredot.style.top=(pos.height-this.hsv[2]/100*pos.height)+'px';
      pos=this.hue.getBoundingClientRect();
      this.huebar.style.top=(this.hsv[0]/359*pos.height)+'px';
      this.wrapper.style.transform="";
    })();
    var mousedown=false,
    updateSquare=(x,y)=>{
      var pos=this.square.getBoundingClientRect(),t;
      this.hsv[1]=Math.floor(((t=x-pos.left)>pos.width?pos.width:t<0?0:t)/pos.width*100);
      this.hsv[2]=Math.floor(((t=y-pos.top)>pos.height?pos.height:t<0?0:t)/pos.height*-100+100);
      this.update();
    },
    updateHue=(x,y)=>{
      var pos=this.hue.getBoundingClientRect(),t=y-pos.top;
      this.hsv[0]=Math.floor((t>pos.height?pos.height:t<0?0:t)/pos.height*359);
      this.update();
    },
    down=(e,touch,f)=>{
      if (!mousedown) {
        mousedown=[f,e=>move(e,false,f),e=>move(e,true,f)];
        if (touch) f(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        else f(e.clientX,e.clientY);
        document.addEventListener("mousemove",mousedown[1],false);
        document.addEventListener("mouseup",up,false);
        document.addEventListener("touchmove",mousedown[2],{passive:false});
        document.addEventListener("touchend",up,{passive:false});
        e.preventDefault();
      }
    },
    move=(e,touch,f)=>{
      if (mousedown[0]===f) {
        if (touch) f(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        else f(e.clientX,e.clientY);
      }
      e.preventDefault();
    },
    up=e=>{
      if (mousedown) {
        document.removeEventListener("mousemove",mousedown[1],false);
        document.removeEventListener("mouseup",up,false);
        document.removeEventListener("touchmove",mousedown[2],{passive:false});
        document.removeEventListener("touchend",up,{passive:false});
        mousedown=false;
      }
      e.preventDefault();
    };
    this.wrapper.addEventListener("mousedown",e=>{
      if (e.target!==this.hex) e.preventDefault();
    },false);
    this.square.addEventListener("mousedown",e=>down(e,false,updateSquare),false);
    this.square.addEventListener("touchstart",e=>down(e,true,updateSquare),{passive:false});
    this.hue.addEventListener("mousedown",e=>down(e,false,updateHue),false);
    this.hue.addEventListener("touchstart",e=>down(e,true,updateHue),{passive:false});
    this.hue.addEventListener("wheel",e=>{
      this.hsv[0]+=Math.round(e.deltaY/25);
      this.hsv[0]=Math.min(Math.max(this.hsv[0],0),359);
      this.update();
    },false);
    this.radio.addEventListener("click",e=>{
      this.radio.focus();
    },false);
    this.setColour=this.radio.setColour=newColour=>{
      this.hex.value=newColour;
      if (window.Event) this.hex.dispatchEvent(new Event('change'));
      else if ("createEvent" in document) {
        var e=document.createEvent("HTMLEvents");
        e.initEvent("change",false,true);
        this.hex.dispatchEvent(e);
      }
      else this.hex.fireEvent("onchange");
    };
  }
  static applyStyles(elem,styles) {
    for (var prop in styles) elem.style[prop]=styles[prop];
  }
}
(function() {
  var colourpickers=document.querySelectorAll('.simplecolourpicker');
  for (var i=0;i<colourpickers.length;i++) new ColourPicker(colourpickers[i]);
}());

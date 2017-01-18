// too lazy to make my own
var convertCOLOR={
  round(n,place) {
    return Math.round(n/Math.pow(10,place))*Math.pow(10,place);
  },
  hsv2hsl(hsv) {
    // http://stackoverflow.com/questions/3423214/convert-hsb-hsv-color-to-hsl
    var SB={s:hsv.s,b:hsv.v},SL={};
    SL.l = convertCOLOR.round((2 - SB.s) * SB.b / 2,-2);
    SL.s = convertCOLOR.round(SL.l&&SL.l<1 ? SB.s*SB.b/(SL.l<0.5 ? SL.l*2 : 2-SL.l*2) : SL.s,-2);
    if (isNaN(SL.s)) SL.s=0;
    SL.h=hsv.h;
    return SL;
  },
  hsl2hsv(hsl) {
    var SL={s:hsl.s,l:hsl.l},SB={};
    var t = SL.s * (SL.l<0.5 ? SL.l : 1-SL.l);
    SB.b = SL.l+t;
    SB.s = convertCOLOR.round(SL.l>0 ? 2*t/SB.b : SB.s,-2);
    if (isNaN(SB.s)) SB.s=0;
    SB.h=hsl.h;
    SB.v=convertCOLOR.round(SB.b,-2);
    delete SB.b;
    return SB;
  },
  hsl2rgb(hsl) {
    // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    var h=hsl.h,s=hsl.s,l=hsl.l;
    var r, g, b;
    if(s == 0) r = g = b = l; // achromatic
    else {
      var hue2rgb = function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r:Math.round(r*255),
      g:Math.round(g*255),
      b:Math.round(b*255)
    };
  },
  rgb2hsl(rgb) {
    var r=rgb.r/255,g=rgb.g/255,b=rgb.b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min) h = s = 0; // achromatic
    else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
      h:Math.round(h*360)/360,
      s:Math.round(s*100)/100,
      l:Math.round(l*100)/100
    };
  },
  rgb2hex(rgb) {
    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var r=rgb.r,g=rgb.g,b=rgb.b;
    function componentToHex(c) {
      var hex=c.toString(16);
      return hex.length==1?"0"+hex:hex;
    }
    return "#"+componentToHex(r)+componentToHex(g)+componentToHex(b);
  },
  hex2rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  hex2long(hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(m,r,g,b){
      return r+r+g+g+b+b;
    });
  }
}

function canBeDragged(elem,xwise,ywise,moreoptions) {
  var drag={},
  x,y,maxx,maxy,min=false,onchange,
  idenifydrag=e=>{
    let x,y;
    if (xwise) x=Number(elem.style.left.slice(0,-2));
    if (ywise) y=Number(elem.style.top.slice(0,-2));
    if (xwise) x=e.clientX-drag.offx;
    if (ywise) y=e.clientY-drag.offy;
    if (min) {
      if (xwise&&x<0) {drag.offx+=x;x=0;}
      else if (xwise&&maxx&&x>maxx) {drag.offx+=x-maxx;x=maxx;}
      if (ywise&&y<0) {drag.offy+=y;y=0;}
      else if (ywise&&maxy&&y>maxy) {drag.offy+=y-maxy;y=maxy;}
    }
    if (xwise) elem.style.left=x+'px';
    if (ywise) elem.style.top=y+'px';
    if (onchange) {
      if (xwise) onchange(x,y);
      else onchange(y);
    }
  },
  mousedown=(touch,e)=>{
    if (!drag.dragging) {
      drag.dragging=true;
      if (xwise) drag.offx=e.clientX-Number(elem.style.left.slice(0,-2));
      if (ywise) drag.offy=e.clientY-Number(elem.style.top.slice(0,-2));
      if (touch) {
        elem.parentNode.ontouchmove=e=>{
          if (drag.dragging) {
            idenifydrag(e.touches[0]);
            e.preventDefault();
            return false;
          }
        };
        elem.parentNode.ontouchend=e=>{
          if (drag.dragging) {
            drag.dragging=false;
            elem.parentNode.ontouchmove=null;
            elem.parentNode.ontouchend=null;
          }
        };
      } else {
        elem.parentNode.onmousemove=e=>{
          if (drag.dragging) {
            idenifydrag(e);
          }
        };
        elem.parentNode.onmouseup=e=>{
          if (drag.dragging) {
            idenifydrag(e);
            drag.dragging=false;
            elem.parentNode.onmousemove=null;
            elem.parentNode.onmouseup=null;
          }
        };
      }
    }
  };
  if (moreoptions) {
    if (xwise) elem.style.left=(moreoptions.x||0)+'px';
    if (ywise) elem.style.top=(moreoptions.y||0)+'px';
    maxx=moreoptions.maxx;
    maxy=moreoptions.maxy;
    if (maxx||maxy) min=true;
    onchange=moreoptions.onchange;
  }
  elem.parentNode.onmousedown=e=>mousedown(false,e);
  elem.parentNode.ontouchstart=e=>mousedown(true,e.touches[0]);
}
function isAColorInput(input,options) {
  if (input&&input.tagName==='INPUT') {
    var picker=document.createElement('colorpicker'),
    inputfocused=false,
    pickerfocused=false,
    timeout,
    prevpickerfocus,
    value={},
    options;
    function isDescendant(parent,child) {
      // http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-contained-within-another
      var node=child.parentNode;
      while (node!=null) {
        if (node==parent)
          return true;
        node=node.parentNode;
      }
      return false;
    }
    (_=>{
      var s,o,
      t=u=>document.createElement(u), // too lazy to type stuff so badly named functions here :D
      v=w=>picker.appendChild(w),
      r=(q,p)=>q.classList.add(p),
      classes,inner;
      s=t('div');
      r(s,'inputsCOLOR');
      r(s,'activeCOLOR');
      classes=['hex','#','rgb','rgb()','hsl','hsl()'];
      inner='';
      for (var i=0;i<classes.length;i+=2)
        inner+='<input type="text" placeholder="'+classes[i+1]+'" class="'+classes[i]+'COLOR"/>';
      s.innerHTML=inner;
      v(s);
      s=t('div');
      r(s,'shadesCOLOR');
      o=t('tints');
      for (var i=0;i<10;i++) o.appendChild(t('tint'));
      o.onmousedown=e=>{
        if (e.target.tagName==='TINT') {
          value.l=Number(e.target.dataset.l);
          updateOtherValues('hsl');
        }
      };
      s.appendChild(o);
      o=t('shades');
      for (var i=0;i<10;i++) o.appendChild(t('shade'));
      o.onmousedown=e=>{
        if (e.target.tagName==='SHADE') {
          value.l=Number(e.target.dataset.l);
          updateOtherValues('hsl');
        }
      };
      s.appendChild(o);
      v(s);
      s=t('div');
      r(s,'wheelCOLOR');
      o=t('saturation');
      o.appendChild(t('value'));
      o.appendChild(t('drag2d'));
      s.appendChild(o);
      o=t('hue');
      o.appendChild(t('drag1d'));
      s.appendChild(o);
      o=t('alpha');
      o.appendChild(t('alphagradient'));
      o.appendChild(t('drag1d'));
      s.appendChild(o);
      v(s);
      s=t('div');
      r(s,'slidersCOLOR');
      classes=['red','green','blue'/*,'cyan','magenta','yellow','key'*/];
      inner='';
      for (var i=0;i<classes.length;i++)
        inner+='<slider class="'+classes[i]+'COLOR"><drag1d></drag1d></slider>';
      s.innerHTML=inner;
      v(s);
      s=t('nav');
      classes=['inputsCOLOR active','Text inputs','shades','Shades and tints','wheel','Color picker','sliders','RGB/CMYK'];
      inner='';
      for (var i=0;i<classes.length;i+=2)
        inner+='<place class="'+classes[i]+'COLOR" title="'+classes[i+1]+'"></place>';
      s.innerHTML=inner;
      s.onclick=e=>{
        if (e.target.tagName==='PLACE') {
          var t=picker.querySelectorAll('.activeCOLOR')
          for (var i=0;i<t.length;i++) t[i].classList.remove('activeCOLOR');
          e.target.classList.add('activeCOLOR');
          picker.querySelector('.'+e.target.classList[0]).classList.add('activeCOLOR');
        }
      };
      v(s);
      o=picker.querySelectorAll('*');
      for (var i=0;i<o.length;i++) o[i].setAttribute('tabindex','0');
      canBeDragged(picker.querySelector('drag2d'),true,true,{maxx:190,maxy:100,onchange(x,y) {
        let t=convertCOLOR.hsv2hsl({s:x/190,v:y/100});
        value.s=t.s;
        value.l=t.l;
        updateOtherValues('hsl','saturation drag2d');
      }});
      canBeDragged(picker.querySelector('hue drag1d'),true,false,{maxx:190,onchange(x) {
        value.h=x/190;
        updateOtherValues('hsl','hue drag1d');
      }});
      canBeDragged(picker.querySelector('slider.redCOLOR drag1d'),true,false,{maxx:190,onchange(x) {
        value.r=Math.round(x/190*255);
        updateOtherValues('rgb','slider.redCOLOR drag1d');
      }});
      canBeDragged(picker.querySelector('slider.greenCOLOR drag1d'),true,false,{maxx:190,onchange(x) {
        value.g=Math.round(x/190*255);
        updateOtherValues('rgb','slider.greenCOLOR drag1d');
      }});
      canBeDragged(picker.querySelector('slider.blueCOLOR drag1d'),true,false,{maxx:190,onchange(x) {
        value.b=Math.round(x/190*255);
        updateOtherValues('rgb','slider.blueCOLOR drag1d');
      }});
    })();
    picker.setAttribute('tabindex','0');
    picker.style.display='none';
    document.body.appendChild(picker);
    input.style.color='transparent';
    input.oninput=()=>input.value='';
    input.onmousedown=()=>{
      if (!inputfocused) {
        inputfocused=true;
        if (!pickerfocused) {
          var rect=input.getBoundingClientRect();
          picker.style.left=(rect.left+window.scrollX)+'px';
          if (window.innerHeight-rect.bottom<210) {
            picker.style.top=(window.scrollY+rect.top-210)+'px';
            picker.classList.add('arrowafterCOLOR');
          } else {
            picker.style.top=(rect.top+window.scrollY+rect.height+10)+'px';
            picker.classList.add('arrowbeforeCOLOR');
          }
          picker.style.display='block';
          picker.classList.add('pickerin');
          timeout=setTimeout(()=>{
            picker.classList.remove('pickerin');
          },300);
        }
      }
      pickerfocused=false;
    };
    input.onblur=()=>{
      if (inputfocused) {
        inputfocused=false;
        if (!pickerfocused) {
          picker.classList.add('pickerout');
          timeout=setTimeout(()=>{
            picker.style.display='none';
            picker.classList.remove('pickerout');
            picker.classList.remove('arrowbeforeCOLOR');
            picker.classList.remove('arrowafterCOLOR');
          },300);
        }
      }
    };
    // mousedown then blur then focus/click
    picker.onmousedown=e=>{
      if (pickerfocused!=e.target) {
        if (prevpickerfocus) prevpickerfocus.onblur=null;
        pickerfocused=e.target;
        clearTimeout(timeout);
        picker.classList.remove('pickerout');
        prevpickerfocus=e.target;
        e.target.focus();
        e.target.onblur=e=>{
          e.target.onblur=null;
          if (pickerfocused) {
            pickerfocused=false;
            if (!inputfocused) {
              picker.classList.add('pickerout');
              timeout=setTimeout(()=>{
                picker.style.display='none';
                picker.classList.remove('pickerout');
                prevpickerfocus=null;
                picker.classList.remove('arrowbeforeCOLOR');
                picker.classList.remove('arrowafterCOLOR');
              },300);
            }
          }
        }
      }
      inputfocused=false;
    };
    if (options&&options.value) input.value=options.value;
    else if (!input.value) input.value='#000';
    input.style.backgroundColor=input.value;
    if ('#rh'.indexOf(input.value[0])===-1) input.value='#'+input.value;
    value.a=1; // temporary
    switch (input.value[0]) {
      case '#':
        value.hex=convertCOLOR.hex2long(input.value);
        updateOtherValues('hex');
        break;
      case 'r':
        var object=input.value.slice(4,-1).split(',');
        value.r=Number(object[0]);
        value.g=Number(object[1]);
        value.b=Number(object[2]);
        updateOtherValues('rgb');
        break;
      case 'h':
        var object=input.value.slice(4,-1).split(',');
        value.h=Number(object[0])/360;
        value.s=Number(object[1].slice(0,-1))/100;
        value.l=Number(object[2].slice(0,-1))/100;
        updateOtherValues('hsl');
        break;
    }
    function updateOtherValues(change,ignoreme) {
      var change,ignoreme;
      if (change) {
        var object;
        switch (change) {
          case 'hex':
            if (value.hex[0]!=='#') value.hex='#'+value.hex;
            object=convertCOLOR.hex2rgb(value.hex);
            value.r=object.r;
            value.g=object.g;
            value.b=object.b;
            object=convertCOLOR.rgb2hsl(object);
            value.h=object.h;
            value.s=object.s;
            value.l=object.l;
            break;
          case 'rgb':
            value.hex=convertCOLOR.rgb2hex(value);
            object=convertCOLOR.rgb2hsl(value);
            value.h=object.h;
            value.s=object.s;
            value.l=object.l;
            break;
          case 'hsl':
            object=convertCOLOR.hsl2rgb(value);
            value.r=object.r;
            value.g=object.g;
            value.b=object.b;
            value.hex=convertCOLOR.rgb2hex(object);
            break;
        }
      }
      function sel(selector) {
        if (ignoreme!==selector) return picker.querySelector(selector);
        else return {style:{}};
      }
      sel('input.hexCOLOR').value=value.hex;
      sel('input.rgbCOLOR').value='rgb('+value.r+','+value.g+','+value.b+')';
      sel('input.hslCOLOR').value='hsl('+Math.round(value.h*360)+','+(value.s*100)+'%,'+(value.l*100)+'%)';
      sel('hue drag1d').style.left=Math.round(value.h*190)+'px';
      sel('alpha drag1d').style.left=Math.round(value.a*190)+'px';
      sel('alphagradient').style.backgroundImage='linear-gradient(to right,transparent,'+value.hex+')';
      var brightness=convertCOLOR.hsl2hsv(value);
      sel('saturation').style.backgroundColor='hsl('+Math.round(value.h*360)+',100%,50%)';
      sel('saturation drag2d').style.top=Math.round(brightness.v*100)+'px';
      sel('saturation drag2d').style.left=Math.round(brightness.s*190)+'px';
      sel('slider.redCOLOR').style.backgroundImage='linear-gradient(to right,rgb(0,'+value.g+','+value.b+'),rgb(255,'+value.g+','+value.b+'))';
      sel('slider.redCOLOR drag1d').style.left=Math.round(value.r/255*190)+'px';
      sel('slider.greenCOLOR').style.backgroundImage='linear-gradient(to right,rgb('+value.r+',0,'+value.b+'),rgb('+value.r+',255,'+value.b+'))';
      sel('slider.greenCOLOR drag1d').style.left=Math.round(value.g/255*190)+'px';
      sel('slider.blueCOLOR').style.backgroundImage='linear-gradient(to right,rgb('+value.r+','+value.g+',0),rgb('+value.r+','+value.g+',255))';
      sel('slider.blueCOLOR drag1d').style.left=Math.round(value.b/255*190)+'px';
      var shades=sel('tints').children,
      diff=(100-value.l*100)/10;
      for (var i=0;i<shades.length;i++) {
        shades[i].style.backgroundColor='hsl('+Math.round(value.h*360)+','+(value.s*100)+'%,'+Math.round((i+1)*diff+value.l*100)+'%)';
        shades[i].dataset.l=Math.round((i+1)*diff+value.l*100)/100;
      }
      shades=sel('shades').children,
      diff=value.l*100/10;
      for (var i=0;i<shades.length;i++) {
        shades[i].style.backgroundColor='hsl('+Math.round(value.h*360)+','+(value.s*100)+'%,'+Math.round(i*diff)+'%)';
        shades[i].dataset.l=Math.round(i*diff)/100;
      }
      input.value=value.hex; // probably going to have format option
      input.style.backgroundColor=value.hex;
      if (change&&input.onchange) input.onchange();
    }
    picker.querySelector('input.hexCOLOR').onchange=e=>{
      value.hex=e.target.value;
      if (e.target.value[0]!=='#') e.target.value='#'+e.target.value;
      if (e.target.value.length>7) e.target.value=e.target.value.slice(0,7);
      updateOtherValues('hex','input.hexCOLOR');
    };
    picker.querySelector('input.rgbCOLOR').onchange=e=>{
      var object=e.target.value.slice(4,-1).split(',');
      value.r=Number(object[0]);
      value.g=Number(object[1]);
      value.b=Number(object[2]);
      updateOtherValues('rgb','input.rgbCOLOR');
    };
    picker.querySelector('input.hslCOLOR').onchange=e=>{
      var object=e.target.value.slice(4,-1).split(',');
      value.h=Number(object[0])/360;
      value.s=Number(object[1].slice(0,-1))/100;
      value.l=Number(object[2].slice(0,-1))/100;
      updateOtherValues('hsl','input.hslCOLOR');
    };
  } else {
    console.error('No sir, that\'s not an input element.');
    return 666;
  }
}

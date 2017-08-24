var dom,spaneditor,elements,languageChange=new Event('language'),language="EN",focusedElement,
translations={
  EN:{
    ELEMENTS_AND_STYLES:"Elements and Styles",
    CONSOLE:"Console",
    DECLARATIONS:"Declarations",
    COMPUTED:"Computed",
    PROPERTIES:"Properties"
  }
};
class Tabs {
  constructor(ul,tabs,current) {
    this.ul=ul;
    this.ul.classList.add('tabs');
    this.tabs=tabs;
    this.id=ul.id;
    var t=document.createDocumentFragment();
    for (var tab in tabs) {
      var s=document.createElement("li");
      s.textContent=translations[language][tabs[tab]];
      ((s,w)=>{
        s.addEventListener("language",e=>{
          s.textContent=translations[language][w];
        },false);
      })(s,tabs[tab])
      s.dataset.tab=tab;
      if (tab===current) s.classList.add('active');
      t.appendChild(s);
    }
    this.ul.appendChild(t);
    document.body.classList.add(this.id+'-'+current);
    this.ul.addEventListener("click",e=>{
      if (e.target.tagName==="LI") {
        var c=this.ul.querySelector('.active');
        c.classList.remove('active');
        document.body.classList.remove(this.id+'-'+c.dataset.tab);
        e.target.classList.add('active');
        document.body.classList.add(this.id+'-'+e.target.dataset.tab);
      }
    },false);
  }
}
class Element {
  constructor(fakeDOMobj) {
    this.elem=fakeDOMobj;
    this.wrapper=document.createElement("div");
    this.wrapper.classList.add('element-wrapper');
    this.wrapper.classList.add('collapsed');
    this.openBtn=document.createElement("button");
    this.openBtn.addEventListener("click",e=>{
      this.wrapper.classList.contains('collapsed')?this.wrapper.classList.remove('collapsed'):this.wrapper.classList.add('collapsed');
    },false);
    this.openTag=document.createElement("span");
    this.openTag.appendChild(Element.spanClasses({
      '<':'grey',
      [this.elem.tagName]:'red'
    }));
    for (var attr in this.elem.attributes) {
      this.openTag.appendChild(Element.spanClasses({
        ' ':'grey',
        [attr]:'orange',
        '="':'grey',
        [this.elem.attributes[attr]]:'yellow',
        '"':'grey'
      }));
    }
    this.openTag.appendChild(Element.spanClasses({'>':'grey'}));
    this.openTag.classList.add('element-openTag');
    this.children=document.createElement("div");
    this.children.classList.add('element-children');
    this.closeTag=document.createElement("span");
    this.closeTag.appendChild(Element.spanClasses({
      '</':'grey',
      [this.elem.tagName]:'red',
      '>':'grey'
    }));
    this.closeTag.classList.add('element-closeTag');
    this.wrapper.appendChild(this.openBtn);
    this.wrapper.appendChild(this.openTag);
    this.wrapper.appendChild(this.children);
    this.wrapper.appendChild(this.closeTag);
    this.wrapper.addEventListener("click",e=>{
      if (e.target!==this.openBtn&&!this.children.contains(e.target)) {
        if (focusedElement) focusedElement.wrapper.classList.remove('active');
        this.wrapper.classList.add('active');
        focusedElement=this;
        parent.postMessage({
          type:"COMPUTED STYLES",
          set:null,
          path:this.elem.path,
          id:dom.indexOf(this.elem)
        },"*");
      }
    },false);
    if (!fakeDOMobj.children.length) this.wrapper.classList.add('nochildren');
  }
  computedStyles(styles) {
    while (computed.hasChildNodes()) computed.removeChild(computed.lastChild);
    var t=document.createDocumentFragment();
    for (var prop in styles) {
      var row=document.createElement("div"),
      propelem=document.createElement("span"),
      colon=document.createElement("span"),
      scolon=document.createElement("span"),
      value=document.createElement("span");
      propelem.classList.add('syntax');
      propelem.classList.add('cream');
      propelem.textContent=prop;
      colon.classList.add('syntax');
      colon.classList.add('white');
      colon.textContent=": ";
      scolon.classList.add('syntax');
      scolon.classList.add('white');
      scolon.textContent=";";
      value.classList.add('syntax');
      value.classList.add('orange');
      value.textContent=styles[prop];
      ((prop,val,fakedom)=>{
        val.addEventListener("click",e=>{
          editSpan(val,{
            ondone(e) {
              parent.postMessage({
                type:"COMPUTED STYLES",
                set:{
                  prop:prop,
                  val:e
                },
                path:fakedom.path,
                id:dom.indexOf(fakedom)
              },"*");
            }
          });
        },false);
      })(prop,value,this.elem)
      row.appendChild(propelem);
      row.appendChild(colon);
      row.appendChild(value);
      row.appendChild(scolon);
      t.appendChild(row);
    }
    computed.appendChild(t);
  }
  static spanClasses(obj) {
    var t=document.createDocumentFragment();
    for (var text in obj) {
      var s=document.createElement("span");
      s.textContent=text;
      s.classList.add('syntax');
      s.classList.add(obj[text]);
      if (obj[text]!=='grey')
        (s=>{
          // s.addEventListener("click",e=>{
          //   editSpan(s);
          // },false);
        })(s);
      t.appendChild(s);
    }
    return t;
  }
}
class PlainText {
  constructor(content) {
    this.content=content;
    this.wrapper=document.createDocumentFragment();
    this.text=document.createElement("span");
    this.text.classList.add('syntax');
    this.text.textContent=content;
    this.wrapper.appendChild(this.text);
  }
}
class Text extends PlainText {
  constructor(content) {
    super(content);
    this.text.classList.add('white');
    this.text.classList.add('textNode');
    this.text.innerHTML=Text.showWhiteSpace(this.content);
  }
  static showWhiteSpace(text) {
    var whitespace=false,html='<span class="syntax white">';
    for (var i=0;i<text.length;i++) {
      if (whitespace) {
        if (/\S/.test(text[i])) html+='</span><span class="syntax white">',whitespace=false;
      } else {
        if (/\s/.test(text[i])) html+='</span><span class="syntax grey">',whitespace=true;
      }
      if (whitespace) switch (text[i]) {
        case "\r": html+="¤\n"; break;
        case "\n": html+="¬\n"; break;
        case " ": case "\u00A0": html+="·"; break;
        case "\t": html+="»   "; break;
        default:
          html+=text[i];
      }
      else switch (text[i]) {
        case "<": html+="&lt;"; break;
        case ">": html+="&gt;"; break;
        default:
          html+=text[i];
      }
    }
    html+='</span>';
    return html;
  }
}
class Comment extends PlainText {
  constructor(content) {
    super(content);
    this.text.classList.add('grey');
    this.text.classList.add('commentNode');
  }
}
class Doctype extends PlainText {
  constructor(content) {
    super(content);
    this.text.classList.add('grey');
    this.text.classList.add('doctypeNode');
  }
}
function editSpan(span,options={}) {
  var styles=window.getComputedStyle(span);
  span.classList.add('editting');
  spaneditor.style.display='inline-block';
  spaneditor.style.color=styles.color;
  spaneditor.style.font=styles.font;
  spaneditor.value=span.textContent;
  updatePos();
  updateWidth();
  spaneditor.focus();
  function updatePos() {
    var boundingrect=span.getBoundingClientRect();
    spaneditor.style.left=boundingrect.left+'px';
    spaneditor.style.top=boundingrect.top+'px';
  }
  function updateWidth() {
    span.textContent=spaneditor.value;
    spaneditor.style.width=(span.offsetWidth+3)+'px';
  }
  function removeEvents() {
    elements.removeEventListener("scroll",updatePos,false);
    spaneditor.removeEventListener("input",updateWidth,false);
    spaneditor.removeEventListener("blur",removeEvents,false);
    spaneditor.style.display='none';
    span.classList.remove('editting');
    if (options.ondone) options.ondone(spaneditor.value);
  }
  elements.addEventListener("scroll",updatePos,false);
  spaneditor.addEventListener("input",updateWidth,false);
  spaneditor.addEventListener("blur",removeEvents,false);
}
function rightClick(items,x,y) {
  var wrapper=document.createElement("ul");
  wrapper.classList.add("context-back");
  function createMenu(parent,array) {
    for (var item of array) {
      if (typeof item==="object") {
        var option=document.createElement("li"),submenu;
        option.classList.add('context-option');
        if (item.disabled) option.classList.add('context-disabled');
        if (item.istoggle) {
          parent.classList.add('context-hastoggles');
          if (item.checked) option.classList.add('context-checked');
          option.addEventListener("click",e=>{
            option.classList.contains('context-checked')?option.classList.remove('context-checked'):option.classList.add('context-checked');
          },false);
        }
        if (item.img) {
          var img=document.createElement("img");
          img.src=item.img;
          img.classList.add('context-image');
          option.appendChild(img);
        }
        if (item.label) option.appendChild(document.createTextNode(translations[language][item.label]));
        if (item.onclick) option.addEventListener("click",e=>{
          if (!submenu.contains(e.target)) item.onclick(e);
        },false);
        if (item.subitems) {
          option.classList.add('context-hassubmenu');
          submenu=document.createElement("ul");
          submenu.classList.add("context-submenu");
          createMenu(submenu,item.subitems);
          option.appendChild(submenu);
        }
        parent.appendChild(option);
      } else {
        var line=document.createElement("li");
        line.classList.add('context-hr');
        parent.appendChild(line);
      }
    }
  }
  createMenu(wrapper,items);
  wrapper.style.left=x+'px';
  wrapper.style.top=y+'px';
  document.body.appendChild(wrapper);
  function stop(e) {
    document.body.removeChild(wrapper);
    wrapper=null;
    document.removeEventListener("click",stop,false);
    document.removeEventListener("contextmenu",stop,false);
  }
  document.addEventListener("click",stop,false);
  document.addEventListener("contextmenu",stop,false);
}
window.onload=e=>{
  spaneditor=document.querySelector('#spaneditor'),
  resizer=document.querySelector('#resize'),
  styleresizer=document.querySelector('#resizestyles'),
  styles=document.querySelector('#styles'),
  elements=document.querySelector('#elements'),
  quit=document.querySelector('#quit'),
  computed=document.querySelector('#compstyles'),
  maintabs=new Tabs(document.querySelector('#main'),{
    htmlcss:'ELEMENTS_AND_STYLES',
    console:'CONSOLE'
  },'htmlcss'),
  styletabs=new Tabs(document.querySelector('#styletabs'),{
    declare:'DECLARATIONS',
    compstyles:'COMPUTED',
    props:'PROPERTIES'
  },'compstyles');
  document.addEventListener("contextmenu",e=>{
    rightClick([
      {label:"props"},
      {label:"compstyles",onclick:e=>console.log('hi'),subitems:[
        {label:"declare"}
      ]}
    ],e.clientX,e.clientY);
    e.preventDefault();
  },false);
  resizer.addEventListener("mousedown",e=>{
    parent.postMessage("RESIZE","*");
    e.preventDefault();
    return false;
  },false);
  styleresizer.addEventListener("mousedown",e=>{
    document.body.style.pointerEvents='none';
    function updateWidth(e) {
      styles.style.width=(window.innerWidth-e.clientX)+'px';
      e.preventDefault();
      return false;
    }
    function stop() {
      document.body.style.pointerEvents='all';
      document.removeEventListener("mousemove",updateWidth,false);
      document.removeEventListener("mouseup",stop,false);
      e.preventDefault();
      return false;
    }
    document.addEventListener("mousemove",updateWidth,false);
    document.addEventListener("mouseup",stop,false);
    e.preventDefault();
    return false;
  },false);
  window.addEventListener("message",e=>{
    if (e.data.type) switch (e.data.type) {
      case 'DOM':
        dom=e.data;
        var i=dom.length;
        while (i--) {
          switch (dom[i].type) {
            case 'element':dom[i].representative=new Element(dom[i]);break;
            case 'text':dom[i].representative=new Text(dom[i].text);break;
            case 'comment':dom[i].representative=new Comment(dom[i].text);break;
            case 'doctype':dom[i].representative=new Doctype(dom[i].text);break;
          }
          if (dom[i].children)
            for (var child of dom[i].children)
              if (dom[child].representative)
                dom[i].representative.children.appendChild(dom[child].representative.wrapper);
        }
        elements.appendChild(dom[0].representative.wrapper); // TODO: THIS IS A BAD WAY OF DISPLAYING TOP LEVEL ELEMENTS
        elements.appendChild(dom[1].representative.wrapper);
        break;
      case "RE: COMPUTED STYLES":
        dom[e.data.id].representative.computedStyles(e.data.styles);
        break;
    }
  },false);
  quit.addEventListener("click",e=>{
    parent.postMessage("QUIT","*");
  },false);
};

var dom,spaneditor;
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
    this.children=document.createElement("div");
    this.children.classList.add('element-children');
    this.closeTag=document.createElement("span");
    this.closeTag.appendChild(Element.spanClasses({
      '</':'grey',
      [this.elem.tagName]:'red',
      '>':'grey'
    }));
    this.wrapper.appendChild(this.openBtn);
    this.wrapper.appendChild(this.openTag);
    this.wrapper.appendChild(this.children);
    this.wrapper.appendChild(this.closeTag);
    if (!fakeDOMobj.children.length) this.wrapper.classList.add('nochildren');
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
          s.addEventListener("click",e=>{
            editSpan(s);
          },false);
        })(s);
      t.appendChild(s);
    }
    return t;
  }
}
class Text {
  constructor(content) {
    this.wrapper=document.createDocumentFragment();
    this.text=document.createElement("span");
    this.text.classList.add('syntax');
    this.text.classList.add('white');
    this.text.classList.add('textNode');
    this.text.textContent=content;
    this.wrapper.appendChild(this.text);
  }
}
class Comment extends Text {
  constructor(content) {
    super(content);
    this.text.classList.remove('white');
    this.text.classList.add('grey');
    this.text.classList.remove('textNode');
    this.text.classList.add('commentNode');
  }
}
function editSpan(span) {
  var boundingrect=span.getBoundingClientRect(),
  styles=window.getComputedStyle(span);
  span.classList.add('editting');
  spaneditor.style.display='inline-block';
  spaneditor.style.left=boundingrect.left+'px';
  spaneditor.style.top=boundingrect.top+'px';
  spaneditor.style.width=(span.offsetWidth+3)+'px';
  spaneditor.style.color=styles.color;
  spaneditor.value=span.textContent;
  spaneditor.focus();
  function updateWidth() {
    span.textContent=spaneditor.value;
    spaneditor.style.width=(span.offsetWidth+3)+'px';
  }
  function removeEvents() {
    spaneditor.removeEventListener("input",updateWidth,false);
    spaneditor.removeEventListener("blur",removeEvents,false);
    spaneditor.style.display='none';
    span.classList.remove('editting');
  }
  spaneditor.addEventListener("input",updateWidth,false);
  spaneditor.addEventListener("blur",removeEvents,false);
}
window.onload=e=>{
  spaneditor=document.querySelector('#spaneditor');
  resizer=document.querySelector('#resize');
  resizer.addEventListener("mousedown",e=>{
    parent.postMessage("RESIZE","*");
    e.preventDefault();
    return false;
  },false);
  window.addEventListener("message",e=>{
    if (e.data.type) switch (e.data.type) {
      case 'DOM':
        dom=e.data;
        console.log(dom);
        var i=dom.length;
        while (i--) {
          switch (dom[i].type) {
            case 'element':dom[i].representative=new Element(dom[i]);break;
            case 'text':dom[i].representative=new Text(dom[i].text);break;
            case 'comment':dom[i].representative=new Comment(dom[i].text);break;
          }
          if (dom[i].children)
            for (var child of dom[i].children)
              if (dom[child].representative)
                dom[i].representative.children.appendChild(dom[child].representative.wrapper);
        }
        document.body.appendChild(dom[1].representative.wrapper);
        break;
    }
  },false);
};

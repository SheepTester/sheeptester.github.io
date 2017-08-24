(function() {
  'use strict';
  function applyStyles(elem,obj) {
    for (var prop in obj) elem.style[prop]=obj[prop];
  }
  var frame=document.createElement("iframe");
  frame.src=document.currentScript.src.slice(0,document.currentScript.src.lastIndexOf('.js')+1)+'html';
  applyStyles(frame,{
    zIndex:2147483647,
    border:"none",
    position:"fixed",
    bottom:0,
    left:0,
    width:"100vw",
    height:"200px"
  });
  document.body.appendChild(frame);
  function getDOM(startingFrom) {
    var stack=[startingFrom],result=[],i=0,parents=[],childIndices=[0];
    while (stack.length) {
      if (stack[0]==="CLOSE") {
        parents.splice(-1,1);
        childIndices.splice(-1,1);
      } else if (stack[0].nodeType===Node.DOCUMENT_NODE) {
        if (stack[0].childNodes)
          for (var i=0;i<stack[0].childNodes.length;i++)
            stack.splice(i+1,0,stack[0].childNodes[i]);
      } else {
        var nodeData={
          children:[],
          parent:parents[parents.length-1]
        };
        switch (stack[0].nodeType) {
          case Node.ELEMENT_NODE:
            nodeData.type='element';
            nodeData.tagName=stack[0].tagName.toLowerCase();
            nodeData.attributes={};
            nodeData.path='';
            nodeData.html=stack[0].innerHTML;
            nodeData.text=stack[0].textContent;
            childIndices[childIndices.length-1]++;
            for (var elem of parents) nodeData.path+=result[elem].tagName.toLowerCase()+'>';
            nodeData.path+=nodeData.tagName+`:nth-child(${childIndices[childIndices.length-1]})`;
            for (var attr of stack[0].attributes) nodeData.attributes[attr.name]=attr.value;
            if (parents.length) result[nodeData.parent].children.push(result.length);
            break;
          case Node.TEXT_NODE:
          case Node.COMMENT_NODE:
            nodeData.type=stack[0].nodeType===Node.TEXT_NODE?'text':'comment';
            nodeData.text=stack[0].data;
            if (parents.length) result[nodeData.parent].children.push(result.length);
            break;
          case Node.DOCUMENT_TYPE_NODE:
            nodeData.type='doctype';
            nodeData.text=stack[0].name;
            break;
        }
        if (stack[0].childNodes) {
          for (var i=0;i<stack[0].childNodes.length;i++)
            stack.splice(i+1,0,stack[0].childNodes[i]);
          parents.push(result.length);
          childIndices.push(0);
          stack.splice(i+1,0,"CLOSE");
        }
        result.push(nodeData);
      }
      stack.splice(0,1);
    }
    result.type="DOM";
    return result;
  }
  frame.onload=e=>{
    frame.contentWindow.postMessage(getDOM(document),"*");
  };
  function whenIreceive(e) {
    if (e.data.type) switch (e.data.type) {
      case "COMPUTED STYLES":
        var elem=document.querySelector(e.data.path),styles={},computed=window.getComputedStyle(elem);
        if (e.data.set) {
          elem.style[e.data.set.prop]=e.data.set.val;
        }
        for (var property of computed) styles[property]=computed[property];
        frame.contentWindow.postMessage({
          type:"RE: COMPUTED STYLES",
          id:e.data.id,
          styles:styles
        },"*");
        break;
    }
    else {
      switch (e.data) {
        case "RESIZE":
          frame.style.pointerEvents='none';
          function resizeFrame(e) {
            if (e.clientY>0) frame.style.height=(window.innerHeight-e.clientY)+'px';
            else frame.style.height=window.innerHeight+'px';
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          function stop(e) {
            frame.style.pointerEvents='all';
            document.removeEventListener("mousemove",resizeFrame,false);
            document.removeEventListener("mouseup",stop,false);
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          document.addEventListener("mousemove",resizeFrame,false);
          document.addEventListener("mouseup",stop,false);
          break;
        case "QUIT":
          document.body.removeChild(frame);
          frame=null;
          window.removeEventListener("message",whenIreceive,false);
          break;
      }
    }
  }
  window.addEventListener("message",whenIreceive,false);
}());

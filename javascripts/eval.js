(function() {
  var s;
  if (!document.querySelector('style.EVALDOTJSSTYLETHING')) {
    s=document.createElement("style");
    s.className="EVALDOTJSSTYLETHING";
    s.innerHTML=`
  evalcontainer {
    display: block;
    position: fixed;
    width: 500px;
    height: 350px;
    background: rgba(0,0,0,0.8);
    top: 0;
    left: 0;
    right: 0;
    margin: 50px auto;
    font-size: 0;
    z-index: 100000;
  }
  evalcontainer > textarea.EVALTEXTAREA {
    width: 500px;
    border: none;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 12px;
    height: 200px;
    padding: 5px;
    resize: none;
    position: absolute;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    color: white;
  }
  evalcontainer > evaloutput {
    display: block;
    width: 500px;
    max-height: 150px;
    font-size: 12px;
    font-family: monospace;
    overflow-y: auto;
    color: white;
    box-sizing: border-box;
    padding: 5px;
    position: absolute;
    bottom: 200px;
  }
  evalcontainer > evaloutput > evaloutputentry {
    display: block;
    white-space: pre;
  }
  evalcontainer > evaloutput > evaloutputentry::before {
    content: ">\\00a0";
    color: rgba(255,255,255,0.5);
  }
  evalcontainer > evaloutput > evaloutputentry.EVALRESULT {
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  evalcontainer > evaloutput > evaloutputentry.EVALRESULT::before {
    content: "<\\00a0";
    font-style: normal;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALWARN {
    background: #FFEB3B;
    color: black;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALSTRING {
    color: #FFEB3B;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALNUMBER {
    color: #2196F3;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALFUNCTION {
    font-style: italic;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALUNDEFINED {
    color: #9E9E9E;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALERROR {
    background: #f44336;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALWARN.EVALSTRING {
    color: black;
  }
  evalcontainer > evaloutput > evaloutputentry.EVALLOG::before {
    content: "";
  }
    `;
    document.head.appendChild(s);
  }
  if (!document.querySelector('evalcontainer')) {
    s=document.createElement("evalcontainer");
    var output=document.createElement("evaloutput");
    function createOutputEntry(words) {
      var t=document.createElement("evaloutputentry");
      t.innerHTML=words;
      t.className='EVALLOG';
      output.appendChild(t);
    }
    createOutputEntry('To close this window, do evaljs.close();');
    createOutputEntry('To clear, do evaljs.clear();');
    s.appendChild(output);
    var textarea=document.createElement("textarea");
    textarea.className='EVALTEXTAREA';
    textarea.focus();
    textarea.onkeypress=e=>{
      if (e.keyCode===13&&!e.shiftKey) {
        var t=document.createElement("evaloutputentry"),
        evaloutput;
        t.textContent=textarea.value;
        output.appendChild(t);
        t=document.createElement("evaloutputentry");
        t.classList.add('EVALRESULT');
        try {
          evaloutput=eval(textarea.value);
          switch (typeof evaloutput) {
            case 'object':
              evaloutput=JSON.stringify(evaloutput);
              t.classList.add('EVALFUNCTION');
              break;
            case 'string':
              evaloutput=`"${evaloutput}"`;
              t.classList.add('EVALSTRING');
              break;
            case 'number':
            case 'boolean':
              t.classList.add('EVALNUMBER');
              break;
            case 'function':
              evaloutput=evaloutput.toString();
              t.classList.add('EVALFUNCTION');
              break;
            case 'undefined':
              t.classList.add('EVALUNDEFINED');
              break;
            case 'symbol':
            evaloutput=evaloutput.toString();
              t.classList.add('EVALSTRING');
              break;
          }
        } catch(e) {
          evaloutput=e;
          t.classList.add('EVALERROR');
        }
        t.textContent=evaloutput+'';
        output.appendChild(t);
        output.scrollTop=output.scrollHeight;
        textarea.value='';
        e.preventDefault();
        return false;
      }
    };
    s.appendChild(textarea);
    document.body.appendChild(s);
    evaljs={
      window:s,
      clear() {
        while (output.hasChildNodes()) output.removeChild(output.lastChild);
      },
      close() {
        document.body.removeChild(this.window);
      }
    };
    function merp(u,t) {
      switch (typeof u) {
        case 'object':
          u=JSON.stringify(u);
          t.classList.add('EVALFUNCTION');
          break;
        case 'string':
          u=`"${u}"`;
          t.classList.add('EVALSTRING');
          break;
        case 'number':
        case 'boolean':
          t.classList.add('EVALNUMBER');
          break;
        case 'function':
          u=u.toString();
          t.classList.add('EVALFUNCTION');
          break;
        case 'undefined':
          t.classList.add('EVALUNDEFINED');
          break;
        case 'symbol':
          u=u.toString();
          t.classList.add('EVALSTRING');
          break;
      }
      return u;
    }
    console.log=function(){
      for (var i=0;i<arguments.length;i++) {
        var t=document.createElement("evaloutputentry"),u=arguments[i];
        t.classList.add('EVALLOG');
        u=merp(u,t);
        t.textContent=(u+'').replace(/\s/g,'\\u00a0');
        output.appendChild(t);
      }
    };
    console.warn=function(){
      for (var i=0;i<arguments.length;i++) {
        var t=document.createElement("evaloutputentry"),u=arguments[i];
        t.classList.add('EVALLOG');
        t.classList.add('EVALWARN');
        u=merp(u,t);
        t.textContent=(u+'').replace(/\s/g,'\\u00a0');
        output.appendChild(t);
      }
    };
    console.error=function(){
      for (var i=0;i<arguments.length;i++) {
        var t=document.createElement("evaloutputentry"),u=arguments[i];
        t.classList.add('EVALLOG');
        t.classList.add('EVALERROR');
        u=merp(u,t);
        t.textContent=(u+'').replace(/\s/g,'\\u00a0');
        output.appendChild(t);
      }
    };
  }
}());

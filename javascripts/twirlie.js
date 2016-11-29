if (s!='twirl'&&s!='shake') {
  var s=document.createElement('style');
  s.type='text/css';
  s.appendChild(document.createTextNode(
    '@keyframes shake{0%{transform:translate(-5px,-5px);}25%{transform:translate(5px,-5px);}50%{transform:translate(5px,5px);}75%{transform:translate(-5px,5px);}100%{transform:translate(-5px,-5px);}}@keyframes twirl{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}#TWIRLIE{background:#333;color:white;display:block;position:fixed;bottom:0;left:0;margin:5px;padding:5px 10px;border-radius:5px;-webkit-user-select:none;font-size:12px;}#TWIRLIE:hover{background:#424242;}#TWIRLIE:active{background:#212121;}#TWIRLIECLOSE{background:#f44336;border:none;color:white;font-family:inherit;font-size:inherit;display:inline-block;}#TWIRLIECLOSE:hover{background:#ef5350;}#TWIRLIECLOSE:active{background:#e53935;}'
  ));
  document.head.appendChild(s);
  s=document.createElement('div');
  s.id='TWIRLIE';
  s.innerHTML='Toggle twirl/shake <strong>twirl</strong> <button id="TWIRLIECLOSE">Close</button>';
  document.body.appendChild(s);
  s='twirl';
  var TWIRLIE=function(e){
    if (e.target.id=="TWIRLIE") {
      s=s=='twirl'?'shake':'twirl';
      e.target.querySelector('strong').innerHTML=s;
    }
    else if (e.target.id=="TWIRLIECLOSE") {
      document.body.removeEventListener("click",TWIRLIE);
      document.body.removeChild(document.querySelector('#TWIRLIE'));
    }
    else if (s=='shake') {
      if (e.target.style.animation=='shake .1s linear infinite') e.target.style.animation='';
      else e.target.style.animation='shake .1s linear infinite';
    }
    else {
      if (e.target.style.animation=='twirl 1s linear infinite') e.target.style.animation='';
      else e.target.style.animation='twirl 1s linear infinite';
    }
    var eStyles=e.target.currentStyle?e.target.currentStyle:getComputedStyle(e.target,null);
    if (eStyles.display=="inline") e.target.style.display="inline-block";
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  };
  document.body.addEventListener("click",TWIRLIE);
}

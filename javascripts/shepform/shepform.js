function shep(elem) {
  console.log(elem);
}
(function(){
  shep.tell=function(message){
    var s=document.createElement('shepmessage');
    s.innerHTML=message;
    document.body.appendChild(s);
    setTimeout(()=>{
      s.classList.add('sheptoberemoved');
      setTimeout(()=>document.body.removeChild(s),300);
    },2000)
  };
})();

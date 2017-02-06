(function() {
  var days=Math.floor((Number(new Date('2021-01-20T12:00:00-05:00'))-Number(new Date()))/86400000);
  if (days<=0) {
    document.querySelector('days').innerHTML="finally";
    document.querySelector('sometext').innerHTML="Trump's first term is over";
  } else if (days===1) {
    document.querySelector('days').innerHTML='Trump';
    document.querySelector('sometext').innerHTML='has one more day left';
  }
  else document.querySelector('days').innerHTML=days;
}());

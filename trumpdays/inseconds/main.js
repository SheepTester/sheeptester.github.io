(function() {
  var calc=_=>{
    var days=((Number(new Date('2021-01-20T12:00:00-05:00'))-Number(new Date()))/1000).toString();
    if (days<=0) {
      document.querySelector('days').innerHTML="finally";
      document.querySelector('sometext').innerHTML="Trump's first term is over!";
    } else {
      if (days.indexOf('.')===-1) days+='.000'
      else if (days.length-days.indexOf('.')<4) days+='0'.repeat(4-days.length+days.indexOf('.'));
      document.querySelector('days').innerHTML=days;
    }
  };
  calc();
  console.log(setInterval(calc,30));
}());

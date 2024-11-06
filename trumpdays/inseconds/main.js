(function(inSeconds) {
  var endDate=Number(new Date('2025-01-20T12:00:00-05:00'));
  if (new Date()>=endDate) {
    endDate=Number(new Date('2029-01-20T12:00:00-05:00'));
    document.querySelector('end').innerHTML="(it ends on the 20th of January, 2029)";
    document.getElementById('until-end').innerHTML="until Trump's second (and hopefully final) term ends";
  } else {
    document.querySelector('end').innerHTML="(his inauguration is on the 20th of January, 2025)";
    document.getElementById('until-end').innerHTML="until Trump is inaugurated";
  }
  var divisor=inSeconds?1000:86400000;
  var calc=_=>{
    var days=(endDate-Number(new Date()))/divisor;
    if (!inSeconds) days=Math.ceil(days);
    days=days.toString();
    if (days<=0) {
      document.querySelector('days').innerHTML="finally";
      document.querySelector('sometext').innerHTML="Trump's second term is over!";
    } else if (days===1&&!inSeconds) {
      document.querySelector('days').innerHTML='Trump';
      document.querySelector('sometext').innerHTML='has one more day left';
    } else if (inSeconds) {
      if (days.indexOf('.')===-1) days+='.000'
      else if (days.length-days.indexOf('.')<4) days+='0'.repeat(4-days.length+days.indexOf('.'));
      document.querySelector('days').innerHTML=days;
    }
    else document.querySelector('days').innerHTML=days;
  };
  calc();
  if (inSeconds) console.log(setInterval(calc,30));
}(window.location.pathname.includes('inseconds')));

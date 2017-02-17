(function() {
  var people,
  months=[null,'Jan','Feb',"Mar",'Apr',"May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function ajax(url,callback,error) {
    var xmlHttp=new XMLHttpRequest(),error;
    xmlHttp.onreadystatechange=function(){
      if (xmlHttp.readyState===4) {
        if (xmlHttp.status===200) callback(xmlHttp.responseText);
        else if (error) error(xmlHttp.status);
      }
    };
    xmlHttp.open("GET",url,true); // true for asynchronous
    xmlHttp.send(null);
  }
  ajax('https://sheeptester.github.io/hello-world/people.json',e=>{
    people=JSON.parse(e);
    for (var i=0;i<people.length;i++) {
      var s=document.createElement('person');
      s.innerHTML=people[i].full_name;
      s.dataset.id=i;
      document.querySelector('people').appendChild(s);
    }
  });
  document.querySelector('people').onclick=e=>{
    if (e.target.tagName==='PERSON') {
      var leave=e=>{
        if (e.target===document.body) {
          document.body.classList.remove('bio');
          document.body.removeEventListener("mousedown",leave,false);
          document.body.removeEventListener("touchstart",leave,false);
        }
      };
      // --- FILL OUT INFO ---
      var data=people[Number(e.target.dataset.id)],s;
      document.querySelector('bio').className=data.isgirl?'girl':'boy';
      document.querySelector('name').innerHTML='<nick>'+data.nick+'</nick>'+data.full_name;
      document.querySelector('#race').innerHTML=data.race||'unknown';
      document.querySelector('#bday').innerHTML=data.birthday?data.birthday[0]+' '+months[data.birthday[1]]+' '+data.birthday[2]:'unknown';
      document.querySelector('#born').innerHTML=data.born||'unknown';
      document.querySelector('#alias').innerHTML=data.aliases.join(', ')||"none";
      s='';
      for (var i=0;i<data.ships.length;i+=2) s+=data.ships[i]+' ('+data.ships[i+1]+'), ';
      document.querySelector('#ship').innerHTML=s.slice(0,-2)||"none";
      s='';
      for (var i=0;i<data.schools.length;i+=3) {
        s+=data.schools[i];
        if (data.schools[i+1]===data.schools[i+2]) s+=' ('+data.schools[i+1]+'), ';
        else s+=' ('+data.schools[i+1]+'-'+data.schools[i+2]+'), ';
      }
      document.querySelector('#edu').innerHTML=s.slice(0,-2)||"unknown";
      document.querySelector('#org').innerHTML=data.organisations.join(', ')||"none";
      s='';
      for (var i=0;i<data.profiles.length;i+=2) s+='<a href="'+data.profiles[i+1]+'">'+data.profiles[i]+'</a> ';
      document.querySelector('#profs').innerHTML=s.slice(0,-1)||"none";
      document.querySelector('#desc').innerHTML=data.desc||"is a human I think";
      // --- END ---
      document.body.classList.add('bio');
      document.body.addEventListener("mousedown",leave,false);
      document.body.addEventListener("touchstart",leave,false);
    }
  };
}());

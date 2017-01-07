var methods={
  consvowel:function(){
    var data={
      consonants:[ // ['letter','addbefore','addafter'] bcdfghjk(l)mnpq(r)(s)tvwx(z) NOTE: What about doubles like 'eddie'?
        ['b','hlmrsz','lrsz'],
        ['c','nrsz','krl'],
        ['ch','rsznltw','rl'],
        ['d','rszl','lrsz'],
        ['f','lrszhmntw','lr'],
        ['g','rn','lrn'],
        ['gh','r',''],
        ['h','spwktc','r'],
        ['j','',''],
        ['k','nmc','hlr'],
        ['l','rpkw','p'],
        ['m','lr','ntrszp'],
        ['n','mh','tp'],
        ['p','lrm','lrsh'],
        ['ph','lrm',''],
        ['q','rl',''],
        ['r','bcdfgkpt','h'],
        ['s','bcdfgklmnprt','khtlznm'],
        ['sh','rlzn','rl'],
        ['t','slrzg','lsrw'],
        ['th','rnfxl','rs'],
        ['v','rl','rl'],
        ['w','','rh'],
        ['x','',''],
        ['z','rl','rl']
      ],
      vowels:['a','e','i','o','u','oo','ae','ie','ea','ee','y','ey','ay','oy','ai','ia','io','oi','iu','au','eu','ou']
    },word='',length=Math.floor(Math.random()*8+2),onvowel=!Math.floor(Math.random()*2);
    for (var i=0;i<length;i++) {
      if (onvowel) word+=data.vowels[Math.floor(Math.random()*data.vowels.length)];
      else {
        var j=Math.floor(Math.random()*data.consonants.length);
        if (data.consonants[j][1]&&!Math.floor(Math.random()*3))
          word+=data.consonants[j][1][Math.floor(Math.random()*data.consonants[j][1].length)];
        word+=data.consonants[j][0];
        if (data.consonants[j][2]&&i<length-1&&!Math.floor(Math.random()*3))
          word+=data.consonants[j][2][Math.floor(Math.random()*data.consonants[j][2].length)];
      }
      onvowel=!onvowel;
    }
    return word;
  },
};

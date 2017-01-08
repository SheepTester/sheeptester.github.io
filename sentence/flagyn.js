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
        ['m','lr','ntrszpb'],
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
  simplealternate:function(){
    var consonants='bcdfghjklmnpqrstvwxz',
    vowels='aeiouy',
    word='',
    length=Math.floor(Math.random()*8+2),
    onvowel=!Math.floor(Math.random()*2);
    for (var i=0;i<length;i++) {
      if (onvowel) word+=vowels[Math.floor(Math.random()*vowels.length)];
      else word+=consonants[Math.floor(Math.random()*consonants.length)];
      onvowel=!onvowel;
    }
    return word;
  },
  eyo:function(){
    var consonants='j.k.n.p.r.s.t.rst.nst.rnst.jr.kr.ks.nk.nr.ns.nt.pn.pr.ps.rj.rk.rn.rp.rs.rt.sk.sn.sp.st.tr.ts'.split('.'),
    vowels='aeiou',
    word='',
    length=Math.floor(Math.random()*8+1),
    onvowel=!Math.floor(Math.random()*2);
    for (var i=0;i<length;i++) {
      if (onvowel) word+=vowels[Math.floor(Math.random()*vowels.length)];
      else word+=consonants[Math.floor(Math.random()*consonants.length)];
      onvowel=!onvowel;
    }
    return word;
  },
  easypron:function(){
    var data={
      consonants:[ // ['letter','addafter'] bcdfghjk(l)mnpq(r)(s)tvwx(z) NOTE: What about doubles like 'eddie'?
        ['b','rl'],
        ['c','krl'],
        ['ch','l'],
        ['d','r'],
        ['f','lr'],
        ['g','nlr'],
        'h','j','k',
        ['l','dfmptv'],
        ['m','npbt'],
        ['n','t.th'.split('.')],
        ['p','rlh'],
        ['ph'],['qu'],
        ['r',['st']],
        ['s','khtml'],
        ['t','lr'],
        ['th','r'],
        ['v','rl'],
        ['w','h'],
        'x','z'
      ],
      vowels:'a.e.i.o.u.y.ai.ou.oo.ee'.split('.')
    },word='',length=Math.floor(Math.random()*5+2),onvowel=!Math.floor(Math.random()*2);
    for (var i=0;i<length;i++) {
      if (onvowel) word+=data.vowels[Math.floor(Math.random()*data.vowels.length)];
      else {
        var j=Math.floor(Math.random()*data.consonants.length);
        word+=data.consonants[j][0];
        if (data.consonants[j][2]&&i<length-1&&!Math.floor(Math.random()*3))
          word+=data.consonants[j][2][Math.floor(Math.random()*data.consonants[j][2].length)];
      }
      onvowel=!onvowel;
    }
    return word;
  },
};

var methods={
  consvowel() {
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
  simplealternate() {
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
  eyo() {
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
  easypron() {
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
  chingchong() {
    var data={
      initials:'bpmfdtnlgkhjqxzcsr'.split(''),
      finals:'a.o.e.i.u.ü.ai.ei.ui.ao.ou.iou.ie.üe.er.an.en.in.un.ün.üan.ang.eng.ing.ong.iong.ia.iao.ian.iang.ua.uo.uai.uan.uang.ueng'.split('.'),
      vowels:'aeiou',
      tones:{
        a:'aāáǎà',
        e:'eēéěè',
        i:'iīíǐì',
        o:'oōóǒò',
        u:'uūúǔù',
        ü:'üǖǘǚǜ',
      }
    },word='',tone=Math.floor(Math.random()*5);
    data.initials.push('zh');
    data.initials.push('ch');
    data.initials.push('sh');
    if (Math.floor(Math.random()*2)) {
      word=data.initials[Math.floor(Math.random()*data.initials.length)];
      word+=data.finals[Math.floor(Math.random()*data.finals.length)];
    } else {
      word=data.finals[Math.floor(Math.random()*data.finals.length)];
      if (word[0]=='i') {
        if (data.vowels.includes(word[1])) word='y'+word.slice(1);
        else word='y'+word;
      } else if (word[0]=='u') {
        if (data.vowels.includes(word[1])&&word[1]!='i') word='w'+word.slice(1);
        else word='we'+word.slice(1);
      } else if (word[0]=='ü')
        word='yu'+word.slice(1);
    }
    if (tone>0&&document.querySelector('#tones').checked) {
      if (word.indexOf('a')>-1)
        word=word.slice(0,word.indexOf('a'))+data.tones.a[tone]+word.slice(word.indexOf('a')+1);
      else if (word.indexOf('o')>-1)
        word=word.slice(0,word.indexOf('o'))+data.tones.o[tone]+word.slice(word.indexOf('o')+1);
      else if (word.indexOf('e')>-1)
        word=word.slice(0,word.indexOf('e'))+data.tones.e[tone]+word.slice(word.indexOf('e')+1);
      else if (word.indexOf('i')>-1) {
        if (word[word.indexOf('i')+1]==='u')
          word=word.slice(0,word.indexOf('i')+1)+data.tones.u[tone]+word.slice(word.indexOf('i')+2);
        else
          word=word.slice(0,word.indexOf('i'))+data.tones.i[tone]+word.slice(word.indexOf('i')+1);
      }
      else if (word.indexOf('u')>-1)
        word=word.slice(0,word.indexOf('u'))+data.tones.u[tone]+word.slice(word.indexOf('u')+1);
      else if (word.indexOf('ü')>-1)
        word=word.slice(0,word.indexOf('ü'))+data.tones.ü[tone]+word.slice(word.indexOf('ü')+1);
    }
    return word;
  },
  strictalt() {
    var consonants='thsnrdlymwfg',
    vowels='aeiou',
    length=Math.floor(Math.random()*10+2),
    word='';
    for (var i=0,isvowel=Math.floor(Math.random()*2);i<length;i++,isvowel=!isvowel)
      word+=isvowel?vowels[Math.floor(Math.random()*vowels.length)]:consonants[Math.floor(Math.random()*consonants.length)];
    return word;
  }
};

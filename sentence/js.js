var words={
  "nouns":[ // [noun,plural] USE '' TO AUTOGENERATE
    ['human',''],
    ['baby','babies'],
    ['apple',''],
    ['sheep','sheep'],
    ['computer',''],
    ['helicopter',''],
    ['dancer',''],
    ['strawberry','strawberries'],
    ['fan',''],
    ['potato','potatoes'],
    ['pineapple',''],
    ['thing',''],
  ],
  "verbs":[ // [verb,pastTense,3rdPersonPresent,pastParticiple,presentParticiple,hasObject] USE '' TO AUTOGENERATE; FOR pastParticiple TO COPY FROM pastTense
    ['are','was','is','been','being',1,"were"],
    ['have','had','has','','',1],
    ['like','','like','','',1],
    ['love','','','','',1],
    ['live','','','',''],
    ['die','','','','dying'],
    ['kill','','','','',1],
    ['run','ran','','','running'],
    ['hate','','','','',1],
    ['murder','','','','',1],
    ['confuse','','','','',1],
    ['overcomplicate','','','','',1],
    ['underestimate','','','','',1],
    ['whack','','','','',1],
    ['scare','','','','',1],
    ['ship','','','','shipping',1],
    ['experience','','','','',1],
    ['invade','','','','',1],
    ['dance','','','',''],
    ['code','','','',''],
    ['program','programmed','','','programming'],
    ['doodle','','','',''],
    ['type','','','',''],
    ['cry','cried','cries','',''],
    ['lie','','','','lying'],
    ['talk','','','',''],
    ['listen','','','',''],
    ['exercise','','','',''],
    ['contribute','','','',''],
    ['ski','','','',''],
    ['exist','','','',''],
    ['hang','hung','','','',1],
  ],
  "adjectives":[
    'happy',
    'dead',
    'alive',
    'sheepish',
    'modern',
    'flat',
    'fat',
    'overweight',
    'magical',
    'fake',
    'nonexistent',
    'radioactive',
    'dangerous',
    'beneficial',
  ],
  "adverbs":[
    'happily',
  ]
};
function rand(min,max) {
  var min,max,i=1;
  if (min===undefined) {
    min=0;
    if (max===undefined) max=1;
  } else if (max===undefined) {
    max=min;
    min=0;
    i--;
  }
  return Math.floor(Math.random()*(max-min+i))+min;
}
function decline(word,plur) { // by word we mean the entire word data
  if (word[1]==='') word[1]=word[0]+"s";
  return word[plur?1:0];
}
function conjugate(word,tens,plur,part) {
  if (word[1]==='') {
    if (word[0][word[0].length-1]=="e") word[1]=word[0]+"d";
    else word[1]=word[0]+"ed";
  }
  if (word[2]==='') word[2]=word[0]+"s";
  if (word[3]==='') word[3]=word[1];
  if (word[4]==='') {
    if (word[0][word[0].length-1]=="e") word[4]=word[0].slice(0,-1)+"ing";
    else word[4]=word[0]+"ing";
  }
  var id;
  if (part) id=3+tens;
  else if (tens) id=plur*-2+2;
  else {
    if (word[0]=="are"&&plur) id=6;
    else id=1;
  }
  return word[id];
}
function addArticle(word,plur) { // as a string
  var r="";
  if (rand()) { // let's add an article?
    if (plur) {
      if (rand()) r=["those ","these ","the "][rand(3)];
    } else {
      if (rand()) r=["this ","that ","the "][rand(3)];
      else {
        if (['a', 'e', 'i', 'o', 'u'].indexOf(word[0].toLowerCase())>-1) r="an ";
        else r="a ";
      }
    }
  } else {
    if (plur) r=["no","zero","two","many","countless"][rand(5)]+" ";
    else r="one ";
  }
  return r+word;
}
function capitalize(string) { // http://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
  return string.charAt(0).toUpperCase()+string.slice(1);
}
function gen() {
  var sen={
    "subject":[],
    "predicate":[]
  },tense,pluralSubject,temp;
  tense=rand(3); // create the tense 0=past 1=present 2=future
  if (rand(2)) temp=0; // to be
  else if (rand()) temp=1; // to have
  else temp=rand(words.verbs.length); // random verb
  sen.predicate=words.verbs[temp]; // add the simple predicate thing
  pluralSubject=rand(); // is our subject plural?
  if (sen.predicate[5]&&(temp<4&&rand(2)<1)) { // add noun object if necessary
    var pluralObject=rand();
    sen.object=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralObject),pluralObject); // create random object
  } else if (temp===0) {
    if (rand()) sen.object=words.adjectives[rand(words.adjectives.length)];
    else {
      temp=words.verbs[rand(words.verbs.length)];
      sen.object=conjugate(temp,1,pluralSubject,1);
      if (temp[5]) {
        sen.object+=" ";
        if (rand()) {
          var pluralObject=rand();
          sen.object+=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralObject),pluralObject);
        } else sen.object+=words.adjectives[rand(words.adjectives.length)];
      }
    }
  } else if (temp===1) {
    if (rand()) {
      sen.object=conjugate(words.verbs[rand(words.verbs.length)],0,pluralSubject,1);
      if (temp[5]) {
        sen.object+=" ";
        if (rand()) {
          var pluralObject=rand();
          sen.object+=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralObject),pluralObject);
        } else sen.object+=words.adjectives[rand(words.adjectives.length)];
      }
    }
    else sen.object="to "+(sen.predicate[0]=="are"?"be":sen.predicate[0]);
  } else {
    sen.object="to "+(sen.predicate[0]=="are"?"be":sen.predicate[0]);
  }
  sen.subject=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralSubject),pluralSubject); // create random subject
  if (tense==2) {
    sen.predicate="will "+(sen.predicate[0]=="are"?"be":sen.predicate[0]);
  }
  else sen.predicate=conjugate(sen.predicate,tense,pluralSubject,0);
  
  document.querySelector("#sentence").innerHTML=capitalize(sen.subject+" "+sen.predicate+(sen.object===undefined?'':" "+sen.object)+(rand()?".":"!"));
}
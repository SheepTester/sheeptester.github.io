var words={
  "nouns":[ // [noun,plural] USE '' TO AUTOGENERATE
    ['human',''],
    ['baby','babies'],
  ],
  "verbs":[ // [verb,pastTense,3rdPersonPresent,pastParticiple,presentParticiple,hasObject] USE '' TO AUTOGENERATE; FOR pastParticiple TO COPY FROM pastTense
    ['are','was','is','been','being',true],
    ['has','had','have','','',true],
    ['live','','','','living'],
    ['die','','','','dying'],
    ['like','','like','','liking',true],
  ],
  "adjectives":[
    'happy',
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
  if (word[4]==='') word[4]=word[0]+"ing";
  var id;
  if (part) id=3+tens;
  else if (tens) id=plur*2;
  else id=1;
  return word[id];
}
function addArticle(word,plur) { // as a string
  var r="";
  if (rand()) { // let's add an article?
    if (plur) {
      if (rand()) r="the ";
    } else {
      if (rand()) r="the ";
      else {
        if (['a', 'e', 'i', 'o', 'u'].indexOf(word[0].toLowerCase())>-1) r="an ";
        else r="a ";
      }
    }
  } else {
    // script for adding "some" "two" etc here
  }
  return r+word;
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
  if (sen.predicate[5]) { // add noun object if necessary
    var pluralObject=rand();
    sen.object=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralObject),pluralObject); // create random object
  }
  sen.subject=addArticle(decline(words.nouns[rand(words.nouns.length)],pluralSubject),pluralSubject); // create random subject
  
  console.log(sen);
  document.querySelector("#sentence").innerHTML=JSON.stringify(sen);
}
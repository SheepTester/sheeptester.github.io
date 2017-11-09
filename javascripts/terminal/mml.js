function mml(mml,width=80,outputs={}) {
  mml=mml.split(/\r?\n/);
  mml.meta={
    scripts:[],
    inits:[],
    title:'Untitled'
  };
  function entify(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function dealWith(line) {
    var nodes=[''],
    tagPositions={
      styles:[],
      flexes:[]
    },
    charCount=0;
    for (var i=0;i<line.length;i++) {
      if (line[i]==='<') charCount+=nodes[nodes.length-1].length,nodes.push('<');
      else if (line[i]==='>') {
        nodes[nodes.length-1]+='>';
        var lastNode=nodes[nodes.length-1],
        type=lastNode.slice(1,lastNode.indexOf(':')),
        value=lastNode.slice(lastNode.indexOf(':')+1,-1),
        isText=false;
        switch (type) {
          case 'char':
            nodes[nodes.length-1]=String.fromCharCode(value);
            isText=true;
            break;
          case 'output':
            nodes[nodes.length-1]=outputs[value]||'';
            isText=true;
            break;
          case 'style':
            tagPositions.styles.push(nodes.length-1);
            break;
          case 'tags':
            tagPositions.styles.push(nodes.length-1);
            break;
          case 'flex':
            tagPositions.flexes.push(nodes.length-1);
            nodes[nodes.length-1]=value;
            break;
          case 'meta-script':
            mml.meta.scripts.push(value);
            nodes.splice(-1,1);
            break;
          case 'meta-init':
            mml.meta.inits.push(value);
            nodes.splice(-1,1);
            break;
          case 'meta-title':
            mml.meta.title=value;
            nodes.splice(-1,1);
            break;
          default:
            nodes.splice(-1,1);
        }
        if (isText) charCount+=nodes[nodes.length-1].length;
        nodes.push('');
      }
      else nodes[nodes.length-1]+=line[i];
    }
    charCount+=nodes[nodes.length-1].length;
    charCount=width-charCount;
    var flexRemainder=charCount%tagPositions.flexes.length,
    repeats=Math.floor(charCount/tagPositions.flexes.length);
    for (var i=0;i<tagPositions.flexes.length;i++) {
      var str=nodes[tagPositions.flexes[i]],
      times=repeats+(flexRemainder-->0?1:0);
      if (times<0) times=0;
      if (str.length>1) {
        var slice=times%str.length;
        times=Math.floor(times/str.length);
        nodes[tagPositions.flexes[i]]=str.repeat(times)+str.slice(0,slice);
      } else nodes[tagPositions.flexes[i]]=str.repeat(times);
    }
    var styles={
      colour:'#fff',
      focusable:false,
      italics:false,
      bold:false,
      strikethrough:false,
      underline:false,
      classes:[],
      order:['focusable','italics','bold','strikethrough','underline']
    };
    for (var i=0;i<nodes.length;i++) {
      if (~tagPositions.styles.indexOf(i)) {
        var type=nodes[i].slice(1,nodes[i].indexOf(':')),
        value=nodes[i].slice(nodes[i].indexOf(':')+1,-1);
        if (type==='style') {
          if (value==='reset') {
            styles.colour='#fff';
            styles.focusable=false;
            styles.italics=false;
            styles.bold=false;
            styles.strikethrough=false;
            styles.underline=false;
          } else {
            var colour,others=value;
            if (~value.indexOf('#')) colour=value.slice(value.indexOf('#')),others=value.slice(0,value.indexOf('#'));
            if (colour) styles.colour=colour;
            for (var j=0;j<others.length||j<styles.order.length;j++) {
              if (others[j]==='0') styles[styles.order[j]]=false;
              else if (others[j]==='1') styles[styles.order[j]]=true;
            }
          }
        } else if (type==='tags') {
          styles.classes=value.split(/\s+/);
        }
        nodes[i]=`</span><span style="color:${styles.colour};font-weight:${styles.bold?'bold':'normal'};font-style:${styles.italics?'italic':'normal'};text-decoration:${styles.underline?(styles.strikethrough?'underline line-through':'underline'):(styles.strikethrough?'line-through':'none')};cursor:${styles.focusable?'pointer':'auto'};"${styles.focusable?' tabindex="0"':''} class="${styles.classes.join(' ')}">`;
      } else {
        nodes[i]=entify(nodes[i]);
      }
    }
    return `<span style="color:#fff;font-weight:normal;font-style:normal;text-decoration:none;cursor:auto;" class="">${nodes.join('')}</span>`;
  }
  for (var i=0;i<mml.length;i++) mml[i]=dealWith(mml[i]);
  return mml;
}

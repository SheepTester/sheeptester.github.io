var render={};
(function() {
  var board={},scrollX=0,scrollY=0,tool='life',gens,changed=[];
  render.scroll=(sx,sy=false)=>sy!==false?(scrollX=sx,scrollY=sy,changed=[]):{scrollX:scrollX,scrollY:scrollY};
  render.tool=(newtool)=>(newtool=newtool||false)?(tool=newtool):tool;
  render.board=(newboard)=>(newboard=newboard||false)?(board=newboard):board;
  render.getChildIndex=(node)=>{
    for (var i=0;(node=node.previousSibling);i++);
    return i;
  }
  render.cellClick=e=>{
    if (e.target.tagName==='CELL') {
      var x=render.getChildIndex(e.target),
      y=render.getChildIndex(e.target.parentNode);
      if (board[`${x+scrollX}.${y+scrollY}`]===1) {
        if (tool==='toggle'||tool==='kill') board[`${x+scrollX}.${y+scrollY}`]=0;
      } else {
        if (tool==='toggle'||tool==='life') board[`${x+scrollX}.${y+scrollY}`]=1;
      }
    }
    onresize(); // TEMPORARY
  };
  render.cellEdit=e=>{
    if (e.target.tagName==='CELL'&&!e.target.classList.contains('dying')&&!e.target.classList.contains('living')) {
      if (e.target.classList.contains('live')) {
        if (tool==='toggle'||tool==='kill') e.target.classList.add('dying');
        else e.target.classList.add('living');
      } else {
        if (tool==='toggle'||tool==='life') e.target.classList.add('living');
        else e.target.classList.add('dying');
      }
      changed.push(e.target);
    }
  };
  render.finishedEditing=e=>{
    for (var i=0;i<changed.length;i++) {
      var x=render.getChildIndex(changed[i]),
      y=render.getChildIndex(changed[i].parentNode);
      if (board[`${x+scrollX}.${y+scrollY}`]===1) {
        if (tool==='toggle'||tool==='kill') board[`${x+scrollX}.${y+scrollY}`]=0;
      } else {
        if (tool==='toggle'||tool==='life') board[`${x+scrollX}.${y+scrollY}`]=1;
      }
    }
    changed=[];
  };
  render.getNeighborCount=(offsetX,offsetY)=>{
    var n=0;
    for (var i=0;i<9;i++) if (i!==4&&board[`${offsetX+i%3-1}.${offsetY+Math.floor(i/3)-1}`]===1) n++;
    return n;
  };
  render.update=_=>{
    var newboard={};
    for (var span in board) {
      var x=Number(span.slice(0,span.indexOf('.'))),
      y=Number(span.slice(span.indexOf('.')+1));
      if (board[span]===1) {
        if (Math.abs(render.getNeighborCount(x,y)-2.5)>0.5) newboard[span]=0;
        for (var i=0;i<9;i++)
          if (i!==4&&newboard[`${x+i%3-1}.${y+Math.floor(i/3)-1}`]===undefined&&render.getNeighborCount(x+i%3-1,y+Math.floor(i/3)-1)===3)
            newboard[`${x+i%3-1}.${y+Math.floor(i/3)-1}`]=1;
      }
      else if (render.getNeighborCount(x,y)===3) newboard[span]=1;
      if (newboard[span]===undefined) newboard[span]=board[span];
    }
    board=newboard;
  };
  render.testBoard=(boardElem,width,height)=>{
    while (boardElem.hasChildNodes()) boardElem.removeChild(boardElem.lastChild);
    for (var i=0;i<height;i++) {
      var s=document.createElement("row");
      for (var j=0;j<width;j++) {
        var t=document.createElement("cell");
        if (board[`${j+scrollX}.${i+scrollY}`]!==undefined) {
          if (board[`${j+scrollX}.${i+scrollY}`]===0) {
            t.classList.add('dead');
            if (render.getNeighborCount(j+scrollX,i+scrollY)===3) t.classList.add('llchange');
          } else if (board[`${j+scrollX}.${i+scrollY}`]===1) {
            t.classList.add('live');
            if (Math.abs(render.getNeighborCount(j+scrollX,i+scrollY)-2.5)>0.5) t.classList.add('llchange');
          }
        } else if (render.getNeighborCount(j+scrollX,i+scrollY)===3) t.classList.add('llchange');
        s.appendChild(t);
      }
      boardElem.appendChild(s);
    }
  };
}());

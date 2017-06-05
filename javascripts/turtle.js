// DEFINE BLOCKS TO BE COLLECTED
var stack=[];
Object.defineProperty(window,'moveForward',{
  get:()=>{
    stack.push('move forwards');
    return ()=>{};
  }
});
Object.defineProperty(window,'plantCrop',{
  get:()=>{
    stack.push('plant crop');
    return ()=>{};
  }
});
Object.defineProperty(window,'end',{
  get:()=>{
    stack.push('end loop');
    return ()=>{};
  }
});
function repeat(n) {
  stack.push(['repeat',n]);
}
function turn([direction]) {
  stack.push(['turn',direction]);
}

// CODE STARTS HERE (code from https://studio.code.org/s/mc/stage/1/puzzle/7)

repeat(6)
  plantCrop
  moveForward
end
turn`right`
moveForward
moveForward
turn`right`
repeat(6)
  moveForward
  plantCrop
end

// NOW WE RUN THE CODE

setTimeout(()=>{
  var runpoint=0,repeatinc,repeatincstop,repeatpoints=[],
  map=[],
  loop=setInterval(()=>{
    if (runpoint>=stack.length) clearInterval(loop);
    else {
      if (stack[runpoint][0]==='repeat') {
        repeatinc=0,repeatincstop=stack[runpoint][1];
        repeatpoints.push(runpoint);
      } else if (stack[runpoint]==='end loop') {
        if (repeatinc<repeatincstop) runpoint=repeatpoints[repeatpoints.length-1];
        else repeatpoints.splice(-1,1);
        repeatinc++;
      }
      else if (stack[runpoint][0]==='turn') console.log('turning '+stack[runpoint][1]);
      else if (stack[runpoint]==='move forwards') console.log('going forwards');
      else if (stack[runpoint]==='plant crop') console.log('planted crop');
      runpoint++;
    }
  },300);
},500);

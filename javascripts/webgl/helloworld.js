// http://learningwebgl.com/blog/?p=28
var triangleVPB, // vpb vertex position buffer
squareVPB;
var shaderProgram;
inits.buffer=function(){
  // holds details of stuff we're drawing supposedly
  triangleVPB=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,triangleVPB);
  var vertices = [
    0.0,1.0,0.0,
    -1.0,-1.0,0.0,
    1.0,-1.0,0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  triangleVPB.itemSize=3;
  triangleVPB.numItems=3;
  // square time
  squareVPB=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,squareVPB);
  vertices = [
    1.0,1.0,0.0,
    -1.0,1.0,0.0,
    1.0,-1.0,0.0,
    -1.0,-1.0,0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  squareVPB.itemSize=3;
  squareVPB.numItems=4;
};
function init() {
  inits.gl(inits.canvas);
  inits.shader();
  inits.buffer();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  draw();
}
function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45,gl.viewportWidth/gl.viewportHeight,0.1,100.0,pMatrix);
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix,[-1.5,0.0,-7.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER,triangleVPB);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,triangleVPB.itemSize,gl.FLOAT,false,0,0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES,0,triangleVPB.numItems);
  mat4.translate(mvMatrix,[3.0,0.0,0.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER,squareVPB);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,squareVPB.itemSize,gl.FLOAT,false,0,0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP,0,squareVPB.numItems);
}

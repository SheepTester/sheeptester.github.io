class Pen {
  constructor(width=480,height=360) {
    this.canvas=document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.c=this.canvas.getContext('2d');
    this.pixelratio=(window.devicePixelRatio||1)/(this.c.webkitBackingStorePixelRatio||this.c.mozBackingStorePixelRatio||this.c.msBackingStorePixelRatio||this.c.oBackingStorePixelRatio||this.c.backingStorePixelRatio||1);
    this.width=width,this.height=height;
    this.canvas.height=height*this.pixelratio;
    this.canvas.width=width*this.pixelratio;
    this.canvas.style.height=height+'px';
    this.canvas.style.width=width+'px';
    this.c.scale(this.pixelratio,-this.pixelratio);
    this.c.translate(width/2,-height/2);
    this.mouse={down:false,X:0,Y:0};
    this.pen={down:false,size:1,colour:'blue'};
    this.x=0;
    this.y=0;
    this.c.lineCap='round';
    this.c.lineJoin='round';
    this.c.strokeStyle='blue';
    this.c.lineWidth=1;
    document.onmousedown=e=>{
      this.mouse.down=true;
    };
    document.onmouseup=e=>{
      this.mouse.down=false;
    };
    document.onmousemove=e=>{
      this.mouse.X=e.clientX-this.canvas.getBoundingClientRect().left-this.width/2;
      this.mouse.Y=this.canvas.getBoundingClientRect().top-e.clientY+this.height/2;
    };
  }
  get x() {return this._x}
  set x(x) {this.goto(x,this._y);}
  get y() {return this._x}
  set y(y) {this.goto(this._x,y);}
  get color() {return this.colour}
  set color(colour) {this.colour=colour;}
  get colour() {return this.pen.colour}
  set colour(colour) {
    if (typeof colour==='number') colour=('00000'+colour.toString(16)).slice(-6);
    this.pen.colour=colour;
    this.c.strokeStyle=colour;
    this.c.fillStyle=colour;
  }
  get size() {return this.pen.size}
  set size(size) {this.pen.size=size;this.c.lineWidth=size;}
  goto(x,y) {
    if (this.pen.down) {
      this.c.beginPath();
      this.c.moveTo(this._x,this._y);
    }
    this._x=x,this._y=y;
    if (this.pen.down) {
      this.c.lineTo(this._x,this._y);
      this.c.stroke();
    }
  }
  get clear() {
    this.c.clearRect(-this.width/2,-this.height/2,this.width,this.height);
    return ()=>{};
  }
  get penDown() {
    this.pen.down=true;
    this.c.beginPath();
    this.c.arc(this._x,this._y,this.size/2,0,2*Math.PI);
    this.c.fill();
    return ()=>{};
  }
  get penUp() {this.pen.down=false;return ()=>{};}
  wait(n,fn) {
    setTimeout(fn,n*1000);
  }
  repeat(n,fn) {
    for (var i=0;i<n;i++) fn(i);
  }
  forever(fn) {
    var render=()=>{
      fn();
      window.requestAnimationFrame(render);
    };
    render();
  }
  until(test,fn) {
    while (!test) fn();
  }
  colourAt(x,y) {
    var t=c.getImageData(x,y,1,1).data;
    return t[3]*16777216+t[0]*65536+t[1]*256+t[2];
  }
}

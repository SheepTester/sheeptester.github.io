class Line {

  constructor(parent, options, x, y) {
    this.parent = parent;
    this.options = options;

    this.c = parent.pc;
    parent.pc.fillStyle = options._colour_.str;
    this.initX = x;
    this.initY = y;
    this.canvasData = parent.getCanvasData();
    this.changes = [];
  }

  plot(x, y) {
    if (this.parent.inCanvas(x, y)) {
      this.c.fillRect(x, y, 1, 1);
      this.changes.push(this.parent.getPixel(this.canvasData, x, y));
    }
  }

  move(mouseX, mouseY) {
    this.changes.forEach(({x, y}) => this.parent.pc.clearRect(x, y, 1, 1));
    this.changes = [];
    generatePixelLine(this.initX, this.initY, mouseX, mouseY).forEach(([x, y]) => {
      this.plot(x, y);
    });
  }

  end() {
    this.parent.mc.drawImage(this.parent.previewCanvas, 0, 0);
    this.parent.pc.clearRect(0, 0, this.options._width_, this.options._height_);
    return this.changes;
  }

  static getInfo() {
    return {
      id: "line",
      name: "line",
      iconURI: "./img/icon_line.svg",
      translations: {},
      options: []
    };
  }

}

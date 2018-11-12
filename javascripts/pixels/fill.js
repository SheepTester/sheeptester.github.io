class Fill {

  constructor(parent, options, x, y) {
    this.parent = parent;
    this.options = options;

    this.changes = [];
    if (parent.inCanvas(x, y)) {
      const c = parent.mc;
      c.fillStyle = options._colour_.str;
      this.alreadyDrawn = {};
      this.canvasWidth = options._width_;
      this.canvasHeight = options._height_;
      this.targetColour = getPixelAt(c, x, y);
      this.c = c;
      this.canvasData = parent.getCanvasData();
      this.check(x, y);
    }
  }

  sameColour(colour) {
    return this.targetColour.r === colour.r
        && this.targetColour.g === colour.g
        && this.targetColour.b === colour.b
        && this.targetColour.a === colour.a;
  }

  check(x, y) {
    if (this.alreadyDrawn[x + "," + y]) return;
    this.plot(x, y);
    if (x > 0 && this.sameColour(getPixelAt(this.c, x - 1, y))) this.check(x - 1, y);
    if (y > 0 && this.sameColour(getPixelAt(this.c, x, y - 1))) this.check(x, y - 1);
    if (x < this.canvasWidth - 1 && this.sameColour(getPixelAt(this.c, x + 1, y))) this.check(x + 1, y);
    if (y < this.canvasHeight - 1 && this.sameColour(getPixelAt(this.c, x, y + 1))) this.check(x, y + 1);
  }

  plot(x, y) {
    this.changes.push(this.parent.getPixel(this.canvasData, x, y));
    this.c.clearRect(x, y, 1, 1);
    this.c.fillRect(x, y, 1, 1);
    this.alreadyDrawn[x + "," + y] = true;
  }

  end() {
    return this.changes;
  }

  static getInfo() {
    return {
      id: "fill",
      name: "fill tool",
      iconURI: "./img/icon_fill.svg",
      translations: {},
      options: []
    };
  }

}

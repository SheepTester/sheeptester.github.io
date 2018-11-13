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
      this.c = c;
      this.canvasData = parent.getCanvasData();
      this.targetColour = parent.getPixel(this.canvasData, x, y).colour;
      const requests = [[x, y]];
      while (requests.length) {
        const [x, y] = requests.shift();
        if (this.alreadyDrawn[x + "," + y] || !parent.inCanvas(x, y) || !this.sameColour(x, y)) continue;
        this.plot(x, y);
        requests.push([x - 1, y]);
        requests.push([x, y - 1]);
        requests.push([x + 1, y]);
        requests.push([x, y + 1]);
      }
    }
  }

  sameColour(x, y) {
    const colour = this.parent.getPixel(this.canvasData, x, y).colour;
    return this.targetColour[0] === colour[0]
        && this.targetColour[1] === colour[1]
        && this.targetColour[2] === colour[2]
        && this.targetColour[3] === colour[3];
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

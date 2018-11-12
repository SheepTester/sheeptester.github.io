class PixelPen {

  constructor(parent, options, x, y) {
    this.parent = parent;
    this.options = options;

    parent.pc.fillStyle = parent.mc.fillStyle = options._colour_.str;
    this.c = options.overwrite ? parent.mc : parent.pc;
    this.alreadyDrawn = {};
    this.changes = [];
    this.lastX = x;
    this.lastY = y;
    this.canvasData = parent.getCanvasData();
  }

  plot(x, y) {
    if (this.parent.inCanvas(x, y) && !this.alreadyDrawn[x + "," + y]) {
      if (this.options.overwrite) this.c.clearRect(x, y, 1, 1);
      this.c.fillRect(x, y, 1, 1);
      this.alreadyDrawn[x + "," + y] = true;
      this.changes.push(this.parent.getPixel(this.canvasData, x, y));
    }
  }

  move(mouseX, mouseY) {
    generatePixelLine(this.lastX, this.lastY, mouseX, mouseY).forEach(([x, y]) => {
      this.plot(x, y);
    });
    this.lastX = mouseX;
    this.lastY = mouseY;
  }

  end() {
    if (!this.options.overwrite) {
      this.parent.mc.drawImage(this.parent.previewCanvas, 0, 0);
      this.parent.pc.clearRect(0, 0, this.options._width_, this.options._height_);
    }
    return this.changes;
  }

  static getInfo() {
    return {
      id: "pixelpen",
      name: "pixel pen",
      iconURI: "./img/icon_pixelpen.svg",
      translations: {},
      options: [
        {
          type: settingTypes.TOGGLE,
          text: "Overwrite pixels?",
          id: "overwrite",
          defaultVal: false
        }
      ]
    };
  }

}

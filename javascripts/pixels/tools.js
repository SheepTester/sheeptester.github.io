function registerTool(tool) {
  //
}

class PixelPen {
  constructor() {
    this.id = "pixelpen";
    this.name = "pixel pen";
    this.iconURI = "./icon_pixelpen.svg";
    this.translations = {};
  }
  mouseDown(x, y) {
    //
  }
}
registerTool(new PixelPen());

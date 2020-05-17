const SELECT_HIGHLIGHT_COLOUR = `rgba(255, 255, 255, 0.5)`;

class SelectTool {

  constructor(parent, options, x, y) {
    this.parent = parent;
    this.options = options;

    this.c = parent.pc;
    parent.pc.fillStyle = SELECT_HIGHLIGHT_COLOUR;
    this.initX = this.lastX = x;
    this.initY = this.lastY = y;
  }

  plot(x, y) {
    if (this.parent.inCanvas(x, y)) {
      this.c.fillRect(x, y, 1, 1);
    }
  }

  move(mouseX, mouseY) {
    this.parent.pc.clearRect(this.lastX, this.lastY, this.initX - this.lastX + 1, this.initY - this.lastY + 1);
    this.parent.pc.fillRect(mouseX, mouseY, this.initX - mouseX + 1, this.initY - mouseY + 1);
    this.lastX = mouseX;
    this.lastY = mouseY;
  }

  end() {
    const data = this.parent.mc.getImageData(
      Math.min(this.initX, this.lastX),
      Math.min(this.initY, this.lastY),
      Math.abs(this.initX - this.lastX),
      Math.abs(this.initY - this.lastY)
    );
    // this.parent.mc.clearRect(this.lastX, this.lastY, this.initX - this.lastX + 1, this.initY - this.lastY + 1);
    return {
      select: true,
      data: data,
      x: Math.min(this.initX, this.lastX),
      y: Math.min(this.initY, this.lastY),
      width: Math.abs(this.initX - this.lastX),
      height: Math.abs(this.initY - this.lastY)
    };
  }

  static getInfo() {
    return {
      id: "select",
      name: "select tool",
      iconURI: "./img/icon_cursor.svg",
      translations: {},
      options: []
    };
  }

}

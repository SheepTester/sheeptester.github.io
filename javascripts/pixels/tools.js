const settingTypes = {
  TOGGLE: 0
};

class PixelPen {
  constructor() {
    // meta stuff
    this.id = "pixelpen";
    this.name = "pixel pen";
    this.iconURI = "./icon_pixelpen.svg";
    this.translations = {};
    this.options = [
      {
        type: settingTypes.TOGGLE,
        text: "Overwrite pixels?",
        id: "overwrite"
      }
    ];

    // actually cool stuff
    // (there are none D:)
  }
  drawBegin(x, y, mainContext, previewContext, options) {
    previewContext.fillStyle = mainContext.fillStyle = currentColour.str;
    this.alreadyDrawn = [];
    this.lastX = x;
    this.lastY = y;
  }
  plot(x, y, c, overwrite) {
    if (!this.alreadyDrawn.includes(x + "," + y)) {
      if (overwrite) c.clearRect(x, y, 1, 1);
      c.fillRect(x, y, 1, 1);
      this.alreadyDrawn.push(x + "," + y);
    }
  }
  penMove(mouseX, mouseY, mainContext, previewContext, options) { // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    let context = options.overwrite ? mainContext : previewContext,
    deltaX = mouseX - this.lastX,
    deltaY = mouseY - this.lastY,
    signX = deltaX < 0 ? -1 : 1,
    signY = deltaY < 0 ? -1 : 1,
    error = 0;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      let deltaErr = Math.abs(deltaX / deltaY),
      x = this.lastX;
      for (let y = this.lastY; signY <= 0 ? y >= mouseY : y <= mouseY; y += signY) {
        this.plot(x, y, context, options.overwrite);
        error += deltaErr;
        while (error >= 0.5) {
          x += signX;
          error--;
        }
      }
    } else {
      let deltaErr = Math.abs(deltaY / deltaX),
      y = this.lastY;
      for (let x = this.lastX; signX <= 0 ? x >= mouseX : x <= mouseX; x += signX) {
        this.plot(x, y, context, options.overwrite);
        error += deltaErr;
        while (error >= 0.5) {
          y += signY;
          error--;
        }
      }
    }
    this.lastX = mouseX;
    this.lastY = mouseY;
  }
  drawEnd(mainContext, previewContext, options) {
    if (!options.overwrite) {
      mainContext.drawImage(previewContext.canvas, 0, 0);
      previewContext.clearRect(0, 0, options._width_, options._height_);
    }
  }
}

function loadTools() {
  const mainCanvas = document.querySelector("#output"),
  mainContext = mainCanvas.getContext("2d"),
  previewCanvas = document.querySelector("#preview"),
  previewContext = previewCanvas.getContext("2d"),
  elementInsertMark = document.querySelector("#aftertools"),
  selectTool = document.querySelector("#select");

  let tools = [],
  currentTool = null,
  canvasWidth = 50,
  canvasHeight = 50;

  function mouseMove(e) {
    tools[currentTool].penMove(...getXY(e.clientX, e.clientY, true), mainContext, previewContext, {
      _width_: canvasWidth,
      _height_: canvasHeight
    });
  }
  function mouseUp() {
    tools[currentTool].drawEnd(mainContext, previewContext, {
      _width_: canvasWidth,
      _height_: canvasHeight
    });
    document.removeEventListener("mousemove", mouseMove, false);
    document.removeEventListener("mouseup", mouseUp, false);
  }
  mainCanvas.addEventListener("mousedown", e => {
    if (currentTool !== null) {
      let params = [...getXY(e.clientX, e.clientY, true), mainContext, previewContext, {
        _width_: canvasWidth,
        _height_: canvasHeight
      }];
      tools[currentTool].drawBegin(...params);
      tools[currentTool].penMove(...params);
      drawing = true;
      document.addEventListener("mousemove", mouseMove, false);
      document.addEventListener("mouseup", mouseUp, false);
    }
  }, false);

  function getXY(mouseX, mouseY, round = false) {
    let rect = mainCanvas.getBoundingClientRect(),
    position = [
      (mouseX - rect.left) / rect.width * canvasWidth,
      (mouseY - rect.top) / rect.height * canvasHeight
    ];
    if (round) return position.map(Math.round);
    return position;
  }

  selectTool.addEventListener("click", e => {
    if (currentTool !== null) tools[currentTool].icon.classList.remove("active");
    currentTool = null;
    selectTool.classList.add("active");
  }, false);
  selectTool.classList.add("active");
  
  function registerTool(tool) {
    let id = tools.length;
    tool.icon = document.createElement("li");
    tool.icon.style.backgroundImage = `url("${tool.iconURI}")`;
    tool.icon.classList.add("icon");
    tool.icon.setAttribute("tabindex", "0");
    tool.icon.addEventListener("click", e => {
      if (currentTool !== null) tools[currentTool].icon.classList.remove("active");
      else selectTool.classList.remove("active");
      currentTool = id;
      tool.icon.classList.add("active");
    }, false);
    elementInsertMark.parentNode.insertBefore(tool.icon, elementInsertMark);
    tools.push(tool);
  }

  registerTool(new PixelPen());
}

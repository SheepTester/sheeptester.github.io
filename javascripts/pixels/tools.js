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
    }
  }
  penMove(x, y, mainContext, previewContext, options) {
    if (this.alreadyDrawn.includes(x + "," + y)) return;
    if (options.overwrite) {
      mainContext.clearRect(x, y, 1, 1);
      mainContext.fillRect(x, y, 1, 1);
    } else {
      previewContext.fillRect(x, y, 1, 1);
    }
    this.alreadyDrawn.push(x + "," + y);
  }
  drawEnd(mainContext, previewContext, options) {
    if (!options.overwrite) {
      mainContext.drawImage(previewContext.canvas, 0, 0);
      previewContext.clearRect(0, 0, options.width, options.height);
    }
  }
}

function loadTools() {
  const mainCanvas = document.querySelector("#output"),
  mainContext = mainCanvas.getContext("2d"),
  previewCanvas = document.querySelector("#preview"),
  previewContext = mainCanvas.getContext("2d"),
  elementInsertMark = document.querySelector("#aftertools");

  let tools = [],
  currentTool = null,
  canvasWidth = 300,
  canvasHeight = 300;

  function mouseMove(e) {
    tools[currentTool].penMove(...getXY(e.clientX, e.clientY), mainContext, previewContext, {
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
      let params = [...getXY(e.clientX, e.clientY), mainContext, previewContext, {
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
    if (round) position = position.map(Math.round);
    return position;
  }

  function registerTool(tool) {
    let id = tools.length,
    icon = document.createElement("li");
    icon.style.backgroundImage = `url("${tool.iconURI}")`;
    icon.classList.add("icon");
    icon.setAttribute("tabindex", "0");
    icon.addEventListener("click", e => {
      currentTool = id;
    }, false);
    elementInsertMark.parentNode.insertBefore(icon, elementInsertMark);
    tools.push(tool);
  }

  registerTool(new PixelPen());
}

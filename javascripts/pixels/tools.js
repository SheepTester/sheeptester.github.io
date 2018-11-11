const settingTypes = {
  TOGGLE: 0
};

function generatePixelLine(x1, y1, x2, y2) {
  // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
  const pixels = [],
  deltaX = x2 - x1,
  deltaY = y2 - y1,
  signX = deltaX < 0 ? -1 : 1,
  signY = deltaY < 0 ? -1 : 1;
  let error = 0;
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    let deltaErr = Math.abs(deltaX / deltaY),
    x = x1;
    for (let y = y1; signY <= 0 ? y >= y2 : y <= y2; y += signY) {
      pixels.push([x, y]);
      error += deltaErr;
      while (error >= 0.5) {
        x += signX;
        error--;
      }
    }
  } else {
    let deltaErr = Math.abs(deltaY / deltaX),
    y = y1;
    for (let x = x1; signX <= 0 ? x >= x2 : x <= x2; x += signX) {
      pixels.push([x, y]);
      error += deltaErr;
      while (error >= 0.5) {
        y += signY;
        error--;
      }
    }
  }
  return pixels;
}

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
    previewContext.fillStyle = mainContext.fillStyle = options._colour_.str;
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
  penMove(mouseX, mouseY, mainContext, previewContext, options) {
    const context = options.overwrite ? mainContext : previewContext;
    generatePixelLine(this.lastX, this.lastY, mouseX, mouseY).forEach(([x, y]) => {
      this.plot(x, y, context, options.overwrite);
    });
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
class Fill {
  constructor() {
    // meta stuff
    this.id = "fill";
    this.name = "fill tool";
    this.iconURI = "./icon_fill.svg";
    this.translations = {};
    this.options = [];
  }
  drawBegin(x, y, c, previewContext, options) {
    c.fillStyle = options._colour_.str;
    this.alreadyDrawn = [];
    this.canvasWidth = options._width_;
    this.canvasHeight = options._height_;
    this.targetColour = getPixelAt(c, x, y);
    this.c = c;
    this.check(x, y);
  }
  sameColours(colour1, colour2) {
    return colour1.r === colour2.r
        && colour1.g === colour2.g
        && colour1.b === colour2.b
        && colour1.a === colour2.a;
  }
  check(x, y) {
    if (this.alreadyDrawn.includes(x + "," + y)) return;
    this.plot(x, y);
    if (x > 0 && this.sameColours(this.targetColour, getPixelAt(this.c, x - 1, y))) this.check(x - 1, y);
    if (y > 0 && this.sameColours(this.targetColour, getPixelAt(this.c, x, y - 1))) this.check(x, y - 1);
    if (x < this.canvasWidth - 1 && this.sameColours(this.targetColour, getPixelAt(this.c, x + 1, y))) this.check(x + 1, y);
    if (y < this.canvasHeight - 1 && this.sameColours(this.targetColour, getPixelAt(this.c, x, y + 1))) this.check(x, y + 1);
  }
  plot(x, y) {
    this.c.clearRect(x, y, 1, 1);
    this.c.fillRect(x, y, 1, 1);
    this.alreadyDrawn.push(x + "," + y);
  }
}

function loadTools() {
  const canvasWrapper = document.getElementById('canvases'),
  mainCanvas = document.getElementById("output"),
  mainContext = mainCanvas.getContext("2d"),
  previewCanvas = document.getElementById("preview"),
  previewContext = previewCanvas.getContext("2d"),
  elementInsertMark = document.getElementById("aftertools"),
  selectTool = document.getElementById("select"),
  uiWrapper = document.getElementById('ui-wrapper');

  let tools = [],
  currentTool = null,
  canvasWidth = 50,
  canvasHeight = 50;

  const camera = { scale: 5, x: -20, y: -20 };
  function positionCamera() {
    canvasWrapper.style.transform = `scale(${camera.scale}) translate(${-camera.x}px, ${-camera.y}px)`;
  }
  positionCamera();
  function getXYFromMouse(event) {
    const mouseX = event.type.includes("touch") ? event.touches[0].clientX : event.clientX;
    const mouseY = event.type.includes("touch") ? event.touches[0].clientY : event.clientY;
    const position = [
      Math.floor(mouseX / camera.scale + camera.x),
      Math.floor(mouseY / camera.scale + camera.y)
    ];
    return position;
  }
  document.addEventListener('wheel', e => {
    if (uiWrapper.contains(e.target)) return;
    if (e.ctrlKey || e.metaKey) {
      const change = Math.abs(e.deltaY / 1000) + 1;
      const oldScale = camera.scale;
      let xDiff = -camera.x * oldScale - e.clientX, yDiff = -camera.y * oldScale - e.clientY;
      if (e.deltaY > 0) {
        camera.scale /= change, xDiff /= change, yDiff /= change;
      } else if (e.deltaY < 0) {
        camera.scale *= change, xDiff *= change, yDiff *= change;
      }
      camera.x = -(e.clientX + xDiff) / camera.scale;
      camera.y = -(e.clientY + yDiff) / camera.scale;
      e.preventDefault();
    } else {
      camera.x += (e.shiftKey ? e.deltaY : e.deltaX) / camera.scale;
      camera.y += (e.shiftKey ? e.deltaX : e.deltaY) / camera.scale;
      if (e.deltaX) e.preventDefault();
    }
    positionCamera();
  });

  const pointers = []; // TODO: allow multiple fingers
  function mouseDown(e) {
    if (uiWrapper.contains(e.target)) return;
    let [x, y] = getXYFromMouse(e);
    if (e.which === 2) {
      let colour = getPixelAt(mainContext, x, y);
      currentColour.setColour(colour.r, colour.g, colour.b, colour.a);
    } else if (currentTool !== null) {
      let params = [x, y, mainContext, previewContext, {
        _width_: canvasWidth,
        _height_: canvasHeight,
        _colour_: currentColour
      }];
      if (tools[currentTool].drawBegin) tools[currentTool].drawBegin(...params);
      if (tools[currentTool].penMove) tools[currentTool].penMove(...params);
      drawing = true;
      document.addEventListener("mousemove", mouseMove, false);
      document.addEventListener("mouseup", mouseUp, false);
      document.addEventListener("touchmove", mouseMove, {passive: false});
      document.addEventListener("touchend", mouseUp, {passive: false});
    }
    e.preventDefault();
  }
  function mouseMove(e) {
    if (tools[currentTool].penMove) tools[currentTool].penMove(...getXYFromMouse(e), mainContext, previewContext, {
      _width_: canvasWidth,
      _height_: canvasHeight,
      _colour_: currentColour
    });
    e.preventDefault();
  }
  function mouseUp(e) {
    if (tools[currentTool].drawEnd) tools[currentTool].drawEnd(mainContext, previewContext, {
      _width_: canvasWidth,
      _height_: canvasHeight,
      _colour_: currentColour,
      _rgb_: currentColour
    });
    document.removeEventListener("mousemove", mouseMove, false);
    document.removeEventListener("mouseup", mouseUp, false);
    document.removeEventListener("touchmove", mouseMove, {passive: false});
    document.removeEventListener("touchend", mouseUp, {passive: false});
    e.preventDefault();
  }
  document.addEventListener("mousedown", mouseDown, false);
  document.addEventListener("touchstart", mouseDown, {passive: false});

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
  registerTool(new Fill());
}

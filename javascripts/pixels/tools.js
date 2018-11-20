const settingTypes = {
  TOGGLE: 0
};

function loadTools() {
  const canvasWrapper = document.getElementById('canvases'),
  mainCanvas = document.getElementById("output"),
  mainContext = mainCanvas.getContext("2d"),
  previewCanvas = document.getElementById("preview"),
  previewContext = previewCanvas.getContext("2d"),
  elementInsertMark = document.getElementById("aftertools"),
  uiWrapper = document.getElementById('ui-wrapper'),
  undoBtn = document.getElementById('undo'),
  redoBtn = document.getElementById('redo'),
  widthInput = document.getElementById('width'),
  heightInput = document.getElementById('height'),
  colourPicker = document.getElementById('pickcolour'),
  toolOptions = document.getElementById('tool-section');

  let tools = [],
  currentTool = 0,
  lastTool,
  canvasWidth = 50,
  canvasHeight = 50,
  selected = { data: null, x: 0, y: 0 };
  function resizeCanvas(width, height) {
    previewContext.drawImage(mainCanvas, 0, 0);
    mainCanvas.width = canvasWidth = width;
    mainCanvas.height = canvasHeight = height;
    mainContext.drawImage(previewCanvas, 0, 0);
    previewCanvas.width = width;
    previewCanvas.height = height;
  }
  widthInput.addEventListener('change', e => {
    let val = +widthInput.value >> 0;
    if (isNaN(val) || val < 1) {
      val = widthInput.value = 1;
    }
    resizeCanvas(val, canvasHeight);
  });
  heightInput.addEventListener('change', e => {
    let val = +heightInput.value >> 0;
    if (isNaN(val) || val < 1) {
      val = heightInput.value = 1;
    }
    resizeCanvas(canvasWidth, val);
  });

  const camera = { scale: 5, x: -(window.innerWidth / 5 - canvasWidth - 40) / 2, y: -(window.innerHeight / 5 - canvasHeight) / 2 };
  function positionCamera() {
    canvasWrapper.style.transform = `scale(${camera.scale}) translate(${-camera.x}px, ${-camera.y}px)`;
  }
  positionCamera();
  function getXYFromMouse(mouseX, mouseY, dontRound = false) {
    return dontRound ? [
      mouseX / camera.scale + camera.x,
      mouseY / camera.scale + camera.y
    ] : [
      Math.floor(mouseX / camera.scale + camera.x),
      Math.floor(mouseY / camera.scale + camera.y)
    ];
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

  const pointers = { mouse: null, count: 0 };
  const toolParent = {
    mainCanvas: mainCanvas, previewCanvas: previewCanvas,
    mc: mainContext, pc: previewContext,
    inCanvas(x, y) {
      return x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight;
    },
    getCanvasData() {
      return mainContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
    },
    getPixel(canvasData, x, y) {
      return {
        x: x, y: y,
        colour: canvasData.slice((y * canvasWidth + x) * 4, (y * canvasWidth + x) * 4 + 4)
      };
    }
  };
  function replacePixels(pixels) {
    const cachedData = toolParent.getCanvasData();
    const changes = [];
    pixels.forEach(({x, y, colour}) => {
      if (!toolParent.inCanvas(x, y)) return;
      changes.push(toolParent.getPixel(cachedData, x, y));
      mainContext.fillStyle = `rgb(${colour.slice(0, 3).join(',')},${colour[3] / 255})`;
      mainContext.clearRect(x, y, 1, 1);
      mainContext.fillRect(x, y, 1, 1);
    });
    return changes;
  }
  function getOptions() {
    previewContext.clearRect(0, 0, canvasWidth, canvasHeight);
    let options = {
      _width_: canvasWidth,
      _height_: canvasHeight,
      _colour_: currentColour
    };
    if (tools[currentTool].getOptions)
      options = Object.assign(options, tools[currentTool].getOptions());
    return options;
  }
  function mouseDown(e) {
    if (uiWrapper.contains(e.target)) return;
    if (e.which === 2 || currentTool === -2) {
      const [x, y] = getXYFromMouse(e.clientX, e.clientY);
      if (toolParent.inCanvas(x, y)) {
        const colour = getPixelAt(mainContext, x, y);
        currentColour.setColour(colour.r, colour.g, colour.b, colour.a);
      }
      if (currentTool === -2) {
        currentTool = lastTool;
        if (currentTool >= 0) tools[currentTool].icon.classList.add("active");
      }
    } else if (currentTool >= 0 && e.which < 2) {
      if (e.type.includes('mouse')) {
        if (pointers.mouse !== false) {
          const [x, y] = getXYFromMouse(e.clientX, e.clientY);
          const tool = new tools[currentTool](toolParent, getOptions(), x, y);
          pointers.mouse = tool;
          document.addEventListener("mousemove", mouseMove, false);
          document.addEventListener("mouseup", mouseUp, false);
          if (tool.move) tool.move(x, y);
        }
      } else {
        pointers.mouse = false;
        if (pointers.count === 0) {
          document.addEventListener("touchmove", mouseMove, {passive: false});
          document.addEventListener("touchend", mouseUp, {passive: false});
        }
        Array.from(e.changedTouches).forEach(touch => {
          const [x, y] = getXYFromMouse(touch.clientX, touch.clientY);
          const tool = new tools[currentTool](toolParent, getOptions(), x, y);
          pointers[touch.identifier] = tool;
          pointers.count++;
          if (tool.move) tool.move(x, y);
        });
      }
    }
    e.preventDefault();
  }
  function mouseMove(e) {
    if (pointers.mouse) {
      if (pointers.mouse.move) pointers.mouse.move(...getXYFromMouse(e.clientX, e.clientY));
    } else {
      Array.from(e.changedTouches).forEach(touch => {
        if (pointers[touch.identifier] && pointers[touch.identifier].move) pointers[touch.identifier].move(...getXYFromMouse(touch.clientX, touch.clientY));
      });
    }
    e.preventDefault();
  }
  function mouseUp(e) {
    let changes;
    if (pointers.mouse) {
      changes = pointers.mouse.end();
      if (changes.select) {
        tools[currentTool].icon.classList.remove("active");
        currentTool = -1;
      }
      pointers.mouse = null;
      document.removeEventListener("mousemove", mouseMove, false);
      document.removeEventListener("mouseup", mouseUp, false);
    } else {
      changes = [];
      Array.from(e.changedTouches).forEach(touch => {
        if (pointers[touch.identifier]) {
          const change = pointers[touch.identifier].end();
          if (change.select) {
            tools[currentTool].icon.classList.remove("active");
            currentTool = -1;
            changes = change;
          }
          else changes.push(...change);
          delete pointers[touch.identifier];
          pointers.count--;
        }
      });
      if (pointers.count === 0) {
        document.removeEventListener("touchmove", mouseMove, {passive: false});
        document.removeEventListener("touchend", mouseUp, {passive: false});
        pointers.mouse = null;
      }
    }
    if (currentTool === -1) {
      selected.data = changes.data;
      selected.x = changes.x;
      selected.y = changes.y;
      selected.width = changes.width;
      selected.height = changes.height;
    } else if (changes && changes.length) {
      history.push(changes);
      redoHistory = [];
    }
    previewContext.clearRect(0, 0, canvasWidth, canvasHeight);
    e.preventDefault();
  }
  document.addEventListener("mousedown", mouseDown, false);
  document.addEventListener("touchstart", mouseDown, {passive: false});
  const mouse = {x: 0, y: 0};
  document.addEventListener('mousemove', e => {
    if (pointers.mouse === null && currentTool !== -1) {
      previewContext.clearRect(mouse.x, mouse.y, 1, 1);
      [mouse.x, mouse.y] = getXYFromMouse(e.clientX, e.clientY);
      previewContext.fillStyle = currentColour.str;
      previewContext.fillRect(mouse.x, mouse.y, 1, 1);
    }
  });

  let history = [];
  let redoHistory = [];
  undoBtn.addEventListener('click', e => {
    if (history.length)
      redoHistory.push(replacePixels(history.pop()));
  });
  redoBtn.addEventListener('click', e => {
    if (redoHistory.length)
      history.push(replacePixels(redoHistory.pop()));
  });

  colourPicker.addEventListener('click', e => {
    if (currentTool >= 0) tools[currentTool].icon.classList.remove("active");
    lastTool = currentTool;
    currentTool = -2;
  });

  function registerTool(tool) {
    const toolData = tool.getInfo();
    const id = tools.length;
    const icon = document.createElement("li");
    icon.style.backgroundImage = `url("${toolData.iconURI}")`;
    icon.classList.add("icon");
    icon.setAttribute("tabindex", "0");
    tool.trigger = () => {
      if (currentTool >= 0) tools[currentTool].icon.classList.remove("active");
      currentTool = id;
      icon.classList.add("active");
    };
    icon.addEventListener("click", tool.trigger, false);
    elementInsertMark.parentNode.insertBefore(icon, elementInsertMark);
    tool.icon = icon;
    if (toolData.options.length) {
      const options = {};
      const optionWrapper = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.textContent = toolData.name;
      toolOptions.appendChild(h3);
      toolData.options.forEach(setting => {
        const wrapper = document.createElement('div');
        const label = document.createElement('span');
        label.classList.add('label');
        label.textContent = setting.text;
        switch (setting.type) {
          case settingTypes.TOGGLE:
            wrapper.classList.add('checkbox-wrapper');
            wrapper.appendChild(options[setting.id] = document.createElement('input'));
            options[setting.id].type = 'checkbox';
            options[setting.id].checked = setting.defaultVal;
            wrapper.appendChild(label);
            break;
        }
        toolOptions.appendChild(wrapper);
      });
      toolOptions.appendChild(optionWrapper);
      tool.getOptions = () => {
        const obj = {};
        toolData.options.forEach(({id, type}) => obj[id] = type === settingTypes.TOGGLE ? options[id].checked : options[id].value);
        return obj;
      };
    }
    tools.push(tool);
  }

  registerTool(SelectTool);
  registerTool(PixelPen);
  registerTool(Line);
  registerTool(Fill);

  tools[0].icon.classList.add('active');

  document.addEventListener('keydown', e => {
    let success = false;
    if (e.keyCode >= 49 && e.keyCode <= 57) { // alt+1 to alt+9
      if (e.altKey && tools[e.keyCode - 49]) {
        tools[e.keyCode - 49].trigger();
        success = true;
      }
    } else {
      success = true;
      switch (e.keyCode) {
        case 67: // alt+C
          if (e.altKey) {
            colourPicker.click();
          }
          break;
        case 90: // ctrl+Z
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) redoBtn.click();
            else undoBtn.click();
            success = true;
          }
          break;
        case 90: // ctrl+Y
          if (e.ctrlKey || e.metaKey) {
            redoBtn.click();
            success = true;
          }
          break;
        default:
          success = false;
      }
    }
    if (success) e.preventDefault();
  });
}

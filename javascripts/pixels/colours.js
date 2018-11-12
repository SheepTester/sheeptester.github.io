const RGBtoHSV = (rgb,r,g,b,a,h,s,d)=>([r,g,b]=rgb.map(a=>a/255),a=Math.max(r,g,b),d=a-Math.min(r,g,b),a!==0?s=d/a:s=0,h=-1,h=a===r?(g-b)/d:a===g?2+(b-r)/d:4+(r-g)/d,[(h<0?h+6:h)*60||0,s*100,a*100].map(Math.round)),
SVtoSL = (s,v,l)=>(s/=100,v/=100,l=(2-s)*v/2,[l&&l<1?s*v/(l<0.5?l*2:2-l*2)*100:0,l*100].map(Math.round));

function isSlider(elem, moveFn, doneFn) {
  let touchIdentifier = null;
  let move = e => {
    let boundingRect = elem.getBoundingClientRect();
    if (e.type === "mousemove") {
      moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
    } else if (e.type === "touchmove") {
      moveFn(e.touches[touchIdentifier].clientX - boundingRect.left, e.touches[touchIdentifier].clientY - boundingRect.top, boundingRect);
    }
    e.preventDefault();
  }, up = e => {
    if (e.type === "mouseup") {
      let boundingRect = elem.getBoundingClientRect();
      moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
      document.removeEventListener("mousemove", move, false);
      document.removeEventListener("mouseup", up, false);
    } else if (e.type === "touchend") {
      touchIdentifier = null;
      document.removeEventListener("touchmove", move, {passive: false});
      document.removeEventListener("touchend", up, {passive: false});
    }
    if (doneFn) doneFn();
    e.preventDefault();
  };
  elem.addEventListener("mousedown", e => {
    let boundingRect = elem.getBoundingClientRect();
    moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
    document.addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", up, false);
  }, false);
  elem.addEventListener("touchstart", e => {
    if (touchIdentifier !== null) return;
    touchIdentifier = e.changedTouches[0].identifier;
    let boundingRect = elem.getBoundingClientRect();
    moveFn(e.touches[touchIdentifier].clientX - boundingRect.left, e.touches[touchIdentifier].clientY - boundingRect.top, boundingRect);
    document.addEventListener("touchmove", move, {passive: false});
    document.addEventListener("touchend", up, {passive: false});
  }, false);
}

const currentColour = {h: 174, s: 100, v: 59, a: 1, str: "hsla(174, 100%, 30%, 1)"};
function loadColours() {
  const hsvRect = document.getElementById("colourrect"),
  hsvRectKnob = document.querySelector("#colourrect span"),
  hsvRectHeight = 100,
  hsvRectWidth = 180,

  sliderWidth = 170,
  sliderSidePadding = 5,
  hueSlider = document.getElementById("hue"),
  hueSliderKnob = document.querySelector("#hue span"),

  opacitySlider = document.querySelector("#opacity div"),
  opacitySliderKnob = document.querySelector("#opacity span"),
  opacityInput = document.getElementById("opacityinput"),

  rgbConverterCanvas = document.createElement("canvas"),
  rgbConverterContext = rgbConverterCanvas.getContext("2d"),
  hexInput = document.getElementById("hex");

  rgbConverterCanvas.width = rgbConverterCanvas.height = 1;
  function getRGBA(hsla) {
    rgbConverterContext.clearRect(0, 0, 1, 1);
    rgbConverterContext.fillStyle = hsla;
    rgbConverterContext.fillRect(0, 0, 1, 1);
    return getPixelAt(rgbConverterContext, 0, 0);
  }
  currentColour.setColour = (r, g, b, a) => {
    [currentColour.h, currentColour.s, currentColour.v] = RGBtoHSV([r, g, b]);
    currentColour.a = a;
    updateElements();
    addToHistory();
  };

  function updateElements() {
    let hslConversion = SVtoSL(currentColour.s, currentColour.v),
    saturation = hslConversion[0],
    lightness = hslConversion[1],
    hsl = `hsl(${currentColour.h}, ${saturation}%, ${lightness}%)`;
    hsvRect.style.backgroundColor = `hsl(${currentColour.h}, 100%, 50%)`;
    hsvRectKnob.style.backgroundColor = hsl;
    hsvRectKnob.style.left = (hsvRectWidth * currentColour.s / 100) + "px";
    hsvRectKnob.style.bottom = (hsvRectHeight * currentColour.v / 100) + "px";

    hueSlider.style.backgroundImage = `linear-gradient(
      90deg,
      hsl(0, ${saturation}%, ${lightness}%),
      hsl(60, ${saturation}%, ${lightness}%),
      hsl(120, ${saturation}%, ${lightness}%),
      hsl(180, ${saturation}%, ${lightness}%),
      hsl(240, ${saturation}%, ${lightness}%),
      hsl(300, ${saturation}%, ${lightness}%),
      hsl(0, ${saturation}%, ${lightness}%)
    )`;
    hueSlider.style.backgroundColor = `hsl(0, ${saturation}%, ${lightness}%)`;
    hueSliderKnob.style.left = (sliderWidth * currentColour.h / 360 + sliderSidePadding) + "px";

    opacitySlider.style.backgroundImage = `linear-gradient(270deg, ${hsl}, transparent), linear-gradient(${hsl}, ${hsl})`;
    opacitySliderKnob.style.left = (sliderWidth * currentColour.a + sliderSidePadding) + "px";
    opacityInput.value = Math.round(currentColour.a * 100);

    currentColour.str = `hsla(${currentColour.h}, ${saturation}%, ${lightness}%, ${currentColour.a})`;
    let rgba = getRGBA(currentColour.str);
    hexInput.value = [rgba.r, rgba.g, rgba.b].map(a => ("0" + a.toString(16)).slice(-2)).join("");
    currentColour.r = rgba.r;
    currentColour.g = rgba.g;
    currentColour.b = rgba.b;
  }
  updateElements();

  isSlider(hsvRect, (x, y) => {
    if (x < 0) x = 0;
    else if (x > hsvRectWidth) x = hsvRectWidth;
    currentColour.s = x / hsvRectWidth * 100;
    if (y < 0) y = 0;
    else if (y > hsvRectHeight) y = hsvRectHeight;
    currentColour.v = (1 - y / hsvRectHeight) * 100;
    updateElements();
  }, addToHistory);
  isSlider(hueSlider, x => {
    x -= sliderSidePadding;
    if (x < 0) x = 0;
    else if (x > sliderWidth) x = sliderWidth;
    currentColour.h = x / sliderWidth * 360;
    updateElements();
  }, addToHistory);
  isSlider(opacitySlider, x => {
    x -= sliderSidePadding;
    if (x < 0) x = 0;
    else if (x > sliderWidth) x = sliderWidth;
    currentColour.a = x / sliderWidth;
    updateElements();
  }, addToHistory);

  opacityInput.addEventListener("change", e => {
    let value = +opacityInput.value.replace(/[^0-9.-]/g, "");
    if (!isNaN(value) && value >= 0 && value <= 100) currentColour.a = value / 100;
    updateElements();
    addToHistory();
  }, false);
  hexInput.addEventListener("change", e => {
    let value = hexInput.value.replace(/[^0-9a-f]/gi, "");
    if (value.length < 5) value = value.split("").map(a => a.repeat(2)).join("");
    if (value.length > 6) value = value.slice(0, 6);
    if (value.length === 6) [currentColour.h, currentColour.s, currentColour.v] = RGBtoHSV(value.match(/.{2}/g).map(a=>parseInt(a,16)));
    updateElements();
    addToHistory();
  }, false);

  const MAX_ROW_ITEMS = 8,
  MAX_ROWS = 4,
  historyCanvas = document.querySelector("#colourhistory"),
  c = historyCanvas.getContext("2d");
  pixelateCanvas(c);

  historyCanvas.addEventListener('click', e => {
    const rect = historyCanvas.getBoundingClientRect();
    const colour = getPixelAt(c, e.clientX - rect.left, e.clientY - rect.top);
    currentColour.setColour(colour.r, colour.g, colour.b, colour.a);
  });

  let history = [];
  function addToHistory() {
    c.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    if (currentColour.str !== history[0]) history.splice(0, 0, currentColour.str);
    if (history.length > MAX_ROW_ITEMS * MAX_ROWS) history = history.slice(0, MAX_ROW_ITEMS * MAX_ROWS);
    let rows = Math.ceil(history.length / MAX_ROW_ITEMS),
    firstRowItems = history.length % MAX_ROW_ITEMS,
    globalItemWidth = historyCanvas.width / MAX_ROW_ITEMS,
    itemHeight = historyCanvas.height / rows;
    if (firstRowItems === 0) firstRowItems = MAX_ROW_ITEMS;
    for (let i = 0, itemWidth = historyCanvas.width / firstRowItems; i < firstRowItems; i++) {
      c.fillStyle = history[i];
      c.fillRect(i * itemWidth, 0, itemWidth, itemHeight);
    }
    for (let i = 0, row = 0; i < history.length - firstRowItems; i++) {
      if (i % MAX_ROW_ITEMS === 0) row++;
      c.fillStyle = history[i + firstRowItems];
      c.fillRect((i % MAX_ROW_ITEMS) * globalItemWidth, row * itemHeight, globalItemWidth, itemHeight);
    }
  }
  addToHistory();
}

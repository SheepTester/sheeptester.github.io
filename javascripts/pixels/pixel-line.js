function generatePixelLine(x1, y1, x2, y2) {
  // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
  const pixels = [],
  deltaX = x2 - x1,
  deltaY = y2 - y1,
  signX = Math.sign(deltaX),
  signY = Math.sign(deltaY);
  if (deltaX === 0 && deltaY === 0) return [[x1, y1]];
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

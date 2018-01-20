function hasMaterialRipple(elem, theme) {
  let lastTapTime = 0;
  function onMouseDown(mouseX, mouseY) {
    let ripple = document.createElement("div"),
    elemBoundingRect = elem.getBoundingClientRect(),
    startTime = Date.now(),
    growDistance = Math.hypot(
      Math.max(elemBoundingRect.right - mouseX, mouseX - elemBoundingRect.left),
      Math.max(elemBoundingRect.bottom - mouseY, mouseY - elemBoundingRect.top)
    ) / 5,
    growDuration = growDistance * 31,
    fading = false,
    fadeStartTime;
    ripple.classList.add("ripple");
    ripple.classList.add(theme);
    ripple.style.left = (mouseX - elemBoundingRect.left) + "px";
    ripple.style.top = (mouseY - elemBoundingRect.top) + "px";
    elem.appendChild(ripple);
    function cubicEaseOut(currentTime) {
      currentTime = currentTime / growDuration - 1;
      return growDistance * (currentTime * currentTime * currentTime + 1);
    }
    function updateRippleSize() {
      let currentTime = Date.now(),
      elapsedTime = currentTime - startTime,
      fade;
      if (fading) {
        fade = 1 - (currentTime - fadeStartTime) / 500;
        if (fade < 0) {
          elem.removeChild(ripple);
          ripple = null;
          return;
        }
      }
      if (elapsedTime > growDuration) ripple.style.transform = `scale(${growDistance})`;
      else ripple.style.transform = `scale(${cubicEaseOut(elapsedTime)})`;
      if (fading) ripple.style.opacity = fade;
      else ripple.style.opacity = 1;
      window.requestAnimationFrame(updateRippleSize);
    }
    function onMouseUp(e) {
      fading = true, fadeStartTime = Date.now();
      document.removeEventListener("mouseup", onMouseUp, false);
      document.removeEventListener("touchend", onMouseUp, false);
      if (e.type === "touchend") lastTapTime=fadeStartTime;
    }
    updateRippleSize();
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("touchend", onMouseUp, false);
  }
  elem.addEventListener("mousedown", e => {
    if (Date.now() - lastTapTime > 100) onMouseDown(e.clientX, e.clientY);
  }, false);
  elem.addEventListener("touchstart", e=>{
    onMouseDown(e.touches[0].clientX, e.touches[0].clientY);
  }, false);
  let currentStyles = window.getComputedStyle(elem);
  if (currentStyles.position !== "fixed" && currentStyles.position !== "absolute") elem.style.position = "relative";
  if (currentStyles.display === "inline") elem.style.display = "inline-block";
}
document.addEventListener("DOMContentLoaded", e => {
  let materialBtns = document.getElementsByClassName("material-btn");
  for (let i = materialBtns.length; i--;) {
    hasMaterialRipple(
      materialBtns[i],
      materialBtns[i].classList.contains("ripple-light") ? "light"
        : materialBtns[i].classList.contains("ripple-dark") ? "dark" : "use-theme"
    );
  }
}, false);

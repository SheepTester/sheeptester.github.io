function pixelateCanvas(context) {
  context.imageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
}
function getPixelAt(context, x, y, toString = false) {
  var [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
  a /= 255;
  if (toString) return `rgba(${r}, ${g}, ${b}, ${a})`;
  else return {r: r, g: g, b: b, a: a};
}

class Section {

  constructor(parent, name) {
    this.parent = parent;
    this.name = name;
    this.activated = false;
    this.tab = document.getElementById(name + '-tab');
    this.section = document.getElementById(name + '-section');
    this.focusables = Array.from(this.section.getElementsByClassName('focusable'));
    this.focusables.forEach(f => f.tabIndex = -1);
    this.tab.addEventListener('click', e => {
      if (this.activated) return;
      parent.activeSection.deactivate();
      this.activate();
    });
  }

  activate() {
    if (this.activated) return;
    this.parent.activeSection = this;
    this.activated = true;
    this.tab.classList.add('active');
    this.section.classList.remove('hidden');
    this.focusables.forEach(f => f.removeAttribute('tabindex'));
  }

  deactivate() {
    if (!this.activated) return;
    this.parent.activeSection = null;
    this.activated = false;
    this.tab.classList.remove('active');
    this.section.classList.add('hidden');
    this.focusables.forEach(f => f.tabIndex = -1);
  }

}

document.addEventListener("DOMContentLoaded", e => {
  const parent = {};
  const sections = ['colour', 'tool', 'canvas'].map(s => new Section(parent, s));
  sections[0].activate();

  loadColours();
  loadTools();
}, false);

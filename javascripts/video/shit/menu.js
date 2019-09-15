class Menu {

  constructor(options) {
    this.close = this.close.bind(this);

    this.isOpen = false;
    this.elem = Elem('div', {
      className: 'menu',
      onclick: e => {
        const item = e.target.closest('.menu-item');
        if (item) {
          const fn = options[item.dataset.item].fn;
          if (fn) fn();
          window.requestAnimationFrame(() => this.close());
        }
      }
    }, this.items = options.map(({elem, label, danger}, i) => {
      if (elem) {
        elem.classList.add('menu-item');
        if (danger) elem.classList.add('danger');
        elem.dataset.item = i;
        return elem;
      } else {
        return Elem('button', {
          className: ['menu-item', danger ? 'danger' : null],
          data: {item: i}
        }, [label]);
      }
    }));
  }

  open(x, y) {
    this.elem.style.left = x + 'px';
    this.elem.style.top = y + 'px';
    if (this.isOpen) return;
    this.isOpen = true;
    document.body.appendChild(this.elem);
    window.requestAnimationFrame(() => document.addEventListener('click', this.close));
  }

  close(e) {
    if (e && this.elem.contains(e.target)) return;
    document.removeEventListener('click', this.close);
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.elem.parentNode) this.elem.parentNode.removeChild(this.elem);
  }

}

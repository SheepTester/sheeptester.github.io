class Menu {

  constructor(options, onchoose) {
    this.close = this.close.bind(this);

    this.metadata = null;
    this.elem = Elem('div', {
      className: 'menu',
      onclick: e => {
        const item = e.target.closest('.menu-item');
        if (item) {
          const fn = options[item.dataset.item].fn;
          if (fn) fn(this.metadata);
          if (onchoose) onchoose(options[item.dataset.item].value, this.metadata);
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

  open(x, y, metadata = true) {
    this.elem.style.left = x + 'px';
    this.elem.style.top = y + 'px';
    this.elem.style.maxHeight = (windowHeight - y) + 'px';
    this.metadata = metadata;
    if (!this.elem.parentNode) {
      document.body.appendChild(this.elem);
      document.addEventListener('mousedown', this.close);
    }
  }

  close(e) {
    if (e && this.elem.contains(e.target)) return;
    document.removeEventListener('mousedown', this.close);
    this.metadata = null;
    if (this.elem.parentNode) this.elem.parentNode.removeChild(this.elem);
  }

}

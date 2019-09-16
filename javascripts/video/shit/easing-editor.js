const NS = 'http://www.w3.org/2000/svg';

const easings = {
  // In, Out, InOut
  // https://github.com/postcss/postcss-easings/blob/master/index.js
  Sine: [[0.47, 0, 0.745, 0.715], [0.39, 0.575, 0.565, 1], [0.445, 0.05, 0.55, 0.95]],
  Quad: [[0.55, 0.085, 0.68, 0.53], [0.25, 0.46, 0.45, 0.94], [0.455, 0.03, 0.515, 0.955]],
  Cubic: [[0.55, 0.055, 0.675, 0.19], [0.215, 0.61, 0.355, 1], [0.645, 0.045, 0.355, 1]],
  Quart: [[0.895, 0.03, 0.685, 0.22], [0.165, 0.84, 0.44, 1], [0.77, 0, 0.175, 1]],
  Quint: [[0.755, 0.05, 0.855, 0.06], [0.23, 1, 0.32, 1], [0.86, 0, 0.07, 1]],
  Expo: [[0.95, 0.05, 0.795, 0.035], [0.19, 1, 0.22, 1], [1, 0, 0, 1]],
  Circ: [[0.6, 0.04, 0.98, 0.335], [0.075, 0.82, 0.165, 1], [0.785, 0.135, 0.15, 0.86]],
  Back: [[0.6, -0.28, 0.735, 0.045], [0.175, 0.885, 0.32, 1.275], [0.68, -0.55, 0.265, 1.55]],
  Elastic: ['easeInElastic', 'easeOutElastic', 'easeInOutElastic'],
  Bounce: ['easeInBounce', 'easeOutBounce', 'easeInOutBounce']
};

const SIZE = 50;
const PAD = 5;
const TOTAL = SIZE + PAD * 2;
const DURATION = 500;
const PAUSE = 250;
const STAMPS = 20;
const crudeNumberRegex = /\d+\.?\d*|\d*\.\d+/g;
class EasingEditor {

  constructor() {
    this.animate = this.animate.bind(this);
    this.close = this.close.bind(this);

    this.isOpen = false;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttributeNS(null, 'viewBox', `${-PAD} ${-PAD} ${TOTAL} ${TOTAL}`);
    svg.classList.add('ease-preview');
    this.linePath = document.createElementNS(NS, 'path');
    this.linePath.classList.add('ease-curve');
    this.strokePath = document.createElementNS(NS, 'path');
    this.strokePath.classList.add('ease-control-line');
    svg.appendChild(this.linePath);
    svg.appendChild(this.strokePath);
    this.elem = Elem('div', {
      className: 'ease-editor'
    }, [
      Elem('div', {
        className: 'ease-library'
      }, [
        Elem('button', {
          className: 'ease',
          onclick: e => this.set('constant')
        }, [
          new EaseIcon('constant').svg,
          Elem('span', {className: 'ease-name'}, ['Constant'])
        ]),
        Elem('button', {
          className: 'ease',
          onclick: e => this.set([0.4, 0.4, 0.6, 0.6])
        }, [
          new EaseIcon('linear').svg,
          Elem('span', {className: 'ease-name'}, ['Linear'])
        ]),
        Elem('div', {className: 'ease-table'}, [
          Elem('div', {className: 'ease-row ease-heading-row'}, [
            Elem('div', {className: 'ease-label'}),
            Elem('div', {className: 'ease-heading'}, ['In']),
            Elem('div', {className: 'ease-heading'}, ['Out']),
            Elem('div', {className: 'ease-heading'}, ['InOut'])
          ]),
          ...Object.keys(easings).map(easing => Elem('div', {className: 'ease-row'}, [
            Elem('div', {className: 'ease-label'}, [easing]),
            Elem('button', {className: 'ease-item', onclick: e => this.set(easings[easing][0])}, [new EaseIcon(easings[easing][0]).svg]),
            Elem('button', {className: 'ease-item', onclick: e => this.set(easings[easing][1])}, [new EaseIcon(easings[easing][1]).svg]),
            Elem('button', {className: 'ease-item', onclick: e => this.set(easings[easing][2])}, [new EaseIcon(easings[easing][2]).svg])
          ]))
        ])
      ]),
      Elem('div', {
        className: 'ease-edit'
      }, [
        Elem('label', {
          className: 'ease-text'
        }, [
          'cubic-bezier(',
          this.text = Elem('input', {
            type: 'text',
            className: 'ease-paste',
            onchange: e => {
              const fn = (this.text.value.match(crudeNumberRegex) || []).map(Number);
              if (fn.length === 4 && !~fn.findIndex(isNaN)) {
                this.set(fn);
              }
            }
          }),
          ')'
        ]),
        this.square = Elem('div', {
          className: 'ease-square'
        }, [
          svg,
          this.pointA = isDragTrigger(Elem('div', {
            className: 'ease-control'
          }), ...this.dragControls(true)),
          this.pointB = isDragTrigger(Elem('div', {
            className: 'ease-control'
          }), ...this.dragControls(false))
        ]),
        this.canvas = Elem('canvas', {
          className: 'ease-animation',
          width: 300,
          height: 20
        })
      ])
    ]);
    this.c = this.canvas.getContext('2d');

    this.set([0.25, 0.1, 0.25, 1.0]);
    this.set('constant');
  }

  dragControls(isA) {
    let left, top, width, height;
    return [
      e => {
        ({left, top, width, height} = this.square.getBoundingClientRect());
        width *= SIZE / TOTAL;
        height *= SIZE / TOTAL;
        if (typeof this.fn === 'string') {
          this.set(this.lastFn);
        }
      },
      ({clientX, clientY}) => {
        if (isA) {
          this.set([
            (clientX - left) / width - PAD / TOTAL,
            1 - (clientY - top) / height + PAD / TOTAL,
            this.fn[2],
            this.fn[3]
          ]);
        } else {
          this.set([
            this.fn[0],
            this.fn[1],
            (clientX - left) / width - PAD / TOTAL,
            1 - (clientY - top) / height + PAD / TOTAL
          ]);
        }
      }
    ];
  }

  open(rect) {
    this.isOpen = true;
    if (rect) {
      if (rect.top > windowHeight / 2) {
        this.elem.style.bottom = windowHeight - rect.top + 'px';
      } else {
        this.elem.style.top = rect.bottom + 'px';
      }
    }
    this.animate();
    document.body.appendChild(this.elem);
    document.addEventListener('mousedown', this.close);
  }

  close(e) {
    if (e && this.elem.contains(e.target)) {
      return;
    }
    this.isOpen = false;
    this.onchange = null;
    this.elem.style.left = null;
    this.elem.style.right = null;
    this.elem.style.top = null;
    this.elem.style.bottom = null;
    window.cancelAnimationFrame(this.animateID);
    document.body.removeChild(this.elem);
    document.removeEventListener('mousedown', this.close);
  }

  set(fn) {
    if (typeof fn === 'string') {
      if (!this.lastFn) this.lastFn = this.fn;
      this.square.classList.add('ease-disabled');
    } else if (Array.isArray(fn) && fn.length === 4) {
      this.lastFn = null;
      fn[0] = clamp(fn[0], 0, 1);
      fn[2] = clamp(fn[2], 0, 1);
      this.square.classList.remove('ease-disabled');
      this.pointA.style.left = (fn[0] * SIZE + PAD) / TOTAL * 100 + '%';
      this.pointA.style.top = (1 - (fn[1] * SIZE + PAD) / TOTAL) * 100 + '%';
      this.pointB.style.left = (fn[2] * SIZE + PAD) / TOTAL * 100 + '%';
      this.pointB.style.top = (1 - (fn[3] * SIZE + PAD) / TOTAL) * 100 + '%';
      this.linePath.setAttributeNS(
        null,
        'd',
        `M 0 ${SIZE} C ${fn[0] * SIZE} ${(1 - fn[1]) * SIZE}, ${fn[2] * SIZE} ${(1 - fn[3]) * SIZE} ${SIZE} 0`
      );
      this.strokePath.setAttributeNS(
        null,
        'd',
        `M 0 ${SIZE} L ${fn[0] * SIZE} ${(1 - fn[1]) * SIZE} M ${fn[2] * SIZE} ${(1 - fn[3]) * SIZE} ${SIZE} 0`
      );
      this.text.value = fn.map(a => a.toFixed(2)).join(', ');
    } else {
      throw new Error('what kind of timing function is this lol: ' + fn);
    }
    this.fn = fn;
    if (this.onchange) {
      this.onchange(fn);
    }
  }

  animate() {
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const time = Math.min(Date.now() % (DURATION + PAUSE) / DURATION, 1);
    this.c.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < time * STAMPS; i++) {
      this.c.beginPath(); // separate paths for overlap
      this.c.arc(
        (this.canvas.width - this.canvas.height) * interpolate(i / STAMPS, this.fn) + this.canvas.height / 2,
        this.canvas.height / 2,
        this.canvas.height / 2,
        0,
        2 * Math.PI
      );
      this.c.fill();
    }
    this.c.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.c.beginPath();
    this.c.arc(
      (this.canvas.width - this.canvas.height) * interpolate(time, this.fn) + this.canvas.height / 2,
      this.canvas.height / 2,
      this.canvas.height / 2,
      0,
      2 * Math.PI
    );
    this.c.fill();
    this.animateID = window.requestAnimationFrame(this.animate);
  }

}

const SCALE = 25;
const POINT_RADIUS = 5;
class EaseIcon {

  constructor(init) {
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.setAttributeNS(
      null,
      'viewBox',
      `${-POINT_RADIUS} ${-POINT_RADIUS} ${SCALE + POINT_RADIUS * 2} ${SCALE + POINT_RADIUS * 2}`
    );
    this.svg.classList.add('ease-icon');
    [[0, SCALE], [SCALE, 0]].forEach(([x, y]) => {
      const point = document.createElementNS(NS, 'circle');
      point.setAttributeNS(null, 'cx', x);
      point.setAttributeNS(null, 'cy', y);
      point.setAttributeNS(null, 'r', POINT_RADIUS);
      this.svg.appendChild(point);
    });
    this.path = document.createElementNS(NS, 'path');
    this.svg.appendChild(this.path);
    if (init) this.set(init);
  }

  set(fn, metadata = this.metadata) {
    this.fn = fn;
    // "I can keep metadata for you, Gamepro5-chan!"
    // just too lazy to store `key` elsewhere
    this.metadata = metadata;
    switch (fn) {
      case 'linear':
        this.path.setAttributeNS(null, 'd', `M 0 ${SCALE} L ${SCALE} 0`);
        break;
      case 'constant':
        this.path.setAttributeNS(null, 'd', `M 0 ${SCALE} H ${SCALE}`);
        break;
      case 'easeInElastic':
      case 'easeOutElastic':
      case 'easeInOutElastic':
      case 'easeInBounce':
      case 'easeOutBounce':
      case 'easeInOutBounce':
        let path = `M 0 ${SCALE}`;
        for (let i = 1; i < 10; i++) {
          path += `L ${i / 10 * SCALE} ${(1 - easingsFunctions[fn](i / 10)) * SCALE}`;
        }
        this.path.setAttributeNS(null, 'd', path + `L ${SCALE} 0`);
        break;
      default:
        if (!Array.isArray(fn) || fn.length !== 4) {
          throw new Error('what kind of timing function is this lol: ' + fn);
        }
        this.path.setAttributeNS(
          null,
          'd',
          `M 0 ${SCALE} C ${fn[0] * SCALE} ${(1 - fn[1]) * SCALE}, ${fn[2] * SCALE} ${(1 - fn[3]) * SCALE} ${SCALE} 0`
        );
    }
  }

}

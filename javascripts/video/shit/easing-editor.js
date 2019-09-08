const NS = 'http://www.w3.org/2000/svg';

class EasingEditor {

  constructor() {
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('ease-preview');
    this.linePath = document.createElementNS(NS, 'path');
    this.strokePath = document.createElementNS(NS, 'path');
    svg.appendChild(this.linePath);
    svg.appendChild(this.strokePath);
    this.elem = Elem('div', {
      className: 'ease-editor'
    }, [
      Elem('div', {
        className: 'ease-library'
      }, [
        // TODO
      ]),
      Elem('div', {
        className: 'ease-edit'
      }, [
        Elem('label', {
          className: 'ease-text'
        }, [
          'cubic-bezier(',
          Elem('input', {
            type: 'text',
            className: 'ease-paste'
          }),
          ')'
        ]),
        Elem('div', {
          className: 'ease-square'
        }, [
          svg,
          this.pointA = isDragTrigger(Elem('div', {
            className: 'ease-control'
          }), /* TODO */),
          this.pointB = isDragTrigger(Elem('div', {
            className: 'ease-control'
          }), /* TODO */)
        ])
      ])
    ]);
  }

}

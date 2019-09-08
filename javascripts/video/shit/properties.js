const baseProps = [
  {
    id: 'start',
    label: 'Track start',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  }
];

const mediaProps = [
  {
    id: 'trimStart',
    label: 'Trim start',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  },
  {
    id: 'trimEnd',
    label: 'Trim end',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  },
  {
    id: 'volume',
    label: 'Volume',
    unit: '%',
    digits: 0,
    range: 100,
    defaultVal: 100,
    animatable: true
  }
];
const graphicalProps = [
  {
    id: 'opacity',
    label: 'Opacity',
    unit: '%',
    digits: 0,
    range: 100,
    defaultVal: 100,
    animatable: true
  },
  {
    id: 'xPos',
    label: 'Position X',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'yPos',
    label: 'Position Y',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'xScale',
    label: 'Scale X',
    unit: 'x',
    digits: 3,
    range: 1,
    defaultVal: 1,
    animatable: true
  },
  {
    id: 'yScale',
    label: 'Scale Y',
    unit: 'x',
    digits: 3,
    range: 1,
    defaultVal: 1,
    animatable: true
  },
  {
    id: 'rotation',
    label: 'Rotation',
    unit: '°',
    digits: 1,
    range: 180,
    defaultVal: 0,
    animatable: true
  }
];

const lengthProp = {
  id: 'length',
  label: 'Duration',
  unit: 's',
  digits: 1,
  range: 30,
  defaultVal: 3
};

class Properties {

  constructor(props) {
    this.change = this.change.bind(this);
    this.props = props;
    this.values = {};
    this.keys = {};
    this.elem = Elem('div', {}, props.map(({
      label,
      id,
      digits,
      range,
      unit,
      animatable
    }) => Elem('label', {className: 'property'}, [
      Elem('span', {}, [label]),
      Elem('div', {className: ['input-wrapper', range ? 'number' : 'text']}, [
        this.values[id] = isAdjustableInput(Elem('input', {
          type: range ? 'number' : 'text',
          className: 'value',
          data: {
            digits,
            range,
            id
          },
          oninput: e => this.change(id, false),
          onchange: e => this.change(id, true)
        }), () => this.change(id, true), () => this.change(id, false)),
        Elem('span', {className: 'unit'}, [unit || ' ']),
        animatable && (this.keys[id] = Elem('button', {
          className: 'key',
          onclick: e => this.keyChange(id)
        }))
      ])
    ])));
  }

  setValues(values) {
    this.props.forEach(({id, digits}) => {
      this.values[id].value = digits !== undefined ? values[id].toFixed(digits) : values[id];
    });
  }

  change(id, isFinal) {
    if (this.handler) {
      const {digits} = this.props.find(prop => id === prop.id);
      const input = this.values[id];
      const newValue = this.handler(id, digits !== undefined ? +input.value : input.value, isFinal);
      if (isFinal && newValue !== undefined) {
        input.value = digits !== undefined ? newValue.toFixed(digits) : newValue;
      }
    }
  }

  keyChange(id) {
    if (this.keyHandler) {
      this.keys[id].classList.toggle('active');
      this.keyHandler(id, this.keys[id].classList.contains('active'));
    }
  }

}

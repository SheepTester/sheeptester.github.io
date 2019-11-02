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

const fitProp = {
  id: 'fit',
  label: 'Fit method',
  choices: {
    'contain': 'Contain within video',
    'cover': 'Cover video',
    'stretch': 'Stretch'
  },
  defaultVal: 'contain',
  type: 'select'
};

const textProps = [
  {
    id: 'font',
    label: 'Font',
    defaultVal: 'Open Sans Condensed:300',
    type: 'text'
  },
  {
    id: 'content',
    label: 'Text',
    defaultVal: 'Intentionally ambiguous text',
    type: 'text'
  }
];

const colourProps = [
  {
    id: 'hColour',
    label: 'Hue',
    unit: '°',
    digits: 0,
    range: 360,
    defaultVal: 180,
    animatable: true
  },
  {
    id: 'sColour',
    label: 'Saturation',
    unit: '%',
    digits: 0,
    range: 100,
    defaultVal: 50,
    animatable: true
  },
  {
    id: 'lColour',
    label: 'Lightness',
    unit: '%',
    digits: 0,
    range: 100,
    defaultVal: 100,
    animatable: true
  }
];

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
      animatable,
      choices,
      type = 'number'
    }) => {
      let wrapper;
      if (type === 'select') {
        this.values[id] = Elem('span');
        const menu = new Menu(
          Object.entries(choices).map(([value, label]) => ({value, label})),
          value => {
            this.values[id].dataset.value = value;
            this.values[id].textContent = choices[value];
            this.change(id, true);
          }
        );
        wrapper = Elem('button', {
          type: 'button',
          className: 'input-wrapper prop-select',
          onclick: e => {
            const rect = wrapper.getBoundingClientRect();
            menu.open(rect.left, rect.bottom);
          }
        }, [
          this.values[id],
          Elem('i', {className: 'material-icons'}, ['arrow_drop_down'])
        ]);
      } else if (type === 'text') {
        this.values[id] = Elem('input', {
          type: 'text',
          className: 'value',
          oninput: e => this.change(id, false),
          onchange: e => this.change(id, true)
        });
        wrapper = Elem('div', {className: 'input-wrapper text'}, [this.values[id]]);
      } else {
        this.values[id] = isAdjustableInput(Elem('input', {
          type: 'number',
          className: 'value',
          data: {
            digits,
            range,
            id
          },
          oninput: e => this.change(id, false),
          onchange: e => this.change(id, true)
        }), () => this.change(id, true), () => this.change(id, false));
        wrapper = Elem('div', {className: 'input-wrapper number'}, [
          this.values[id],
          Elem('span', {className: 'unit'}, [unit || ' ']),
          animatable && (this.keys[id] = Elem('button', {
            className: 'key',
            onclick: e => this.keyChange(id)
          }))
        ]);
      }
      return Elem('label', {className: 'property'}, [
        Elem('span', {}, [label]),
        wrapper
      ])
    }));
  }

  setValues(values) {
    this.props.forEach(({id, digits, type, choices}) => {
      if (type === 'select') {
        this.values[id].dataset.value = values[id];
        this.values[id].textContent = choices[values[id]];
      } else if (type === 'text') {
        this.values[id].value = values[id];
      } else {
        this.values[id].value = values[id].toFixed(digits);
      }
    });
  }

  change(id, isFinal) {
    if (this.handler) {
      const {type = 'number', digits} = this.props.find(prop => id === prop.id);
      const input = this.values[id];
      const newValue = this.handler(
        id,
        type === 'select' ? input.dataset.value
          : type === 'text' ? input.value
          : +input.value,
        isFinal
      );
      if (isFinal && newValue !== undefined) {
        if (type === 'select') {
          input.dataset.value = newValue;
          input.textContent = choices[newValue];
        } else if (type === 'text') {
          input.value = newValue;
        } else {
          input.value = newValue.toFixed(digits);
        }
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

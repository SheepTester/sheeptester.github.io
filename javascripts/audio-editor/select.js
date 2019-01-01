function Select(label, options, handler) {
  return createElement('select', {
    classes: 'select',
    children: [
      createElement('option', {
        html: label,
        attributes: {
          value: -1,
          selected: true,
          disabled: true,
          hidden: true
        }
      }),
      ...options.map((option, i) => option === '---' ? createElement('option', {
        html: '─────',
        attributes: {
          disabled: true
        }
      }) : createElement('option', {
        html: option,
        attributes: {
          value: i
        }
      }))
    ],
    listeners: {
      change(e) {
        const val = +this.value;
        if (val !== -1) handler(options[val]);
        this.value = -1;
      }
    }
  });
}

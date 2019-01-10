function Select(label, options, handler) {
  let buttonsWrapper;
  return createElement('div', {
    classes: 'select-wrapper',
    children: [
      createElement('button', {
        classes: 'select-toggle-button',
        html: label,
        listeners: {
          click(e) {
            buttonsWrapper.classList.toggle('show');
          }
        }
      }),
      buttonsWrapper = createElement('div', {
        classes: 'select-options-wrapper',
        children: options.map((option, i) => option === '---' ? createElement('span', {
          classes: 'select-separator'
        }) : createElement('button', {
          classes: 'select-option',
          html: option,
          listeners: {
            click(e) {
              handler(option);
            }
          }
        }))
      })
    ]
  });
}

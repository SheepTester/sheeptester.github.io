function Select(label, options) {
  let buttonsWrapper;
  return Elem('div', {className: 'select-wrapper'}, [
    Elem('button', {
      className: 'select-toggle-button',
      innerHTML: label,
      onclick(e) {
        buttonsWrapper.classList.toggle('show');
      }
    }),
    buttonsWrapper = Elem(
      'div',
      {className: 'select-options-wrapper'},
      options.map(([option, fn]) => option === '---'
        ? Elem('span', {className: 'select-separator'})
        : Elem('button', {
          className: 'select-option',
          innerHTML: option,
          onclick(e) {
            fn(option);
          }
        }))
    )
  ]);
}

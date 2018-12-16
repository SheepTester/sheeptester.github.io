document.addEventListener('DOMContentLoaded', e => {
  const htmlCheckbox = document.getElementById('html');
  const imgCheckbox = document.getElementById('img');
  const otherCheckbox = document.getElementById('other');
  function checkboxChange() {
    document.body.className = [
      htmlCheckbox.checked || 'hidehtml',
      imgCheckbox.checked || 'hideimg',
      otherCheckbox.checked || 'hideother'
    ].join(' ');
  }
  htmlCheckbox.addEventListener('change', checkboxChange);
  imgCheckbox.addEventListener('change', checkboxChange);
  otherCheckbox.addEventListener('change', checkboxChange);

  const dir = Array.from(document.getElementsByClassName('dir'));
  document.getElementById('collapse').addEventListener('click', e => {
    dir.forEach(d => d.classList.add('collapsed'));
  });
  document.getElementById('open').addEventListener('click', e => {
    dir.forEach(d => d.classList.remove('collapsed'));
  });
  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('head'))
      e.target.parentNode.classList.toggle('collapsed');
  });
  document.body.addEventListener('keydown', e => {
    if (e.keyCode === 13 && e.target.classList.contains('head'))
      e.target.parentNode.classList.toggle('collapsed');
  });
});

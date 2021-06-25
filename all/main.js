const collapseBtn = document.getElementById('collapse');
collapseBtn.disabled = false;
collapseBtn.addEventListener('click', e => {
  for (const checkbox of document.querySelectorAll('.dir input[type=checkbox]')) {
    checkbox.checked = true;
  }
});

const openBtn = document.getElementById('open');
openBtn.disabled = false;
openBtn.addEventListener('click', e => {
  for (const checkbox of document.querySelectorAll('.dir input[type=checkbox]')) {
    checkbox.checked = false;
  }
});

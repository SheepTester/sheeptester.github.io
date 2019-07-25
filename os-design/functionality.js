const signinBtn = document.getElementById('sign-in');
document.getElementById('password').addEventListener('keydown', e => {
  if (e.keyCode === 13) signinBtn.click();
});
signinBtn.addEventListener('click', e => {
  document.body.classList.remove('locked');
});

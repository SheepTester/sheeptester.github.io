document.addEventListener("DOMContentLoaded", e => {
  const homeButton = document.createElement("sheep-btn");
  homeButton.setAttribute('tabindex', 0);
  homeButton.setAttribute('aria-label', 'Go to SheepTester directory');
  homeButton.addEventListener('click', e => {
    document.body.classList.add('sheep-blockscreen');
    setTimeout(() => {
      window.location = '/?from=sheep3';
    }, 200);
  });
  homeButton.addEventListener('keydown', e => {
    if (e.keyCode === 13) homeButton.click();
  });
  document.body.appendChild(homeButton);
}, {once: true});

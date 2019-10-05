document.addEventListener("DOMContentLoaded", function(e) {
  var homeButton = document.createElement("sheep-btn");
  homeButton.setAttribute('tabindex', 0);
  homeButton.setAttribute('aria-label', 'Go to SheepTester directory');
  homeButton.addEventListener('click', function(e) {
    document.body.classList.add('sheep-blockscreen');
    homeButton.addEventListener('transitionend', function(e) {
      setTimeout(function() {
        window.location = '/?from=sheep3';
      }, 100);
    });
  });
  homeButton.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) homeButton.click();
  });
  document.body.appendChild(homeButton);
}, {once: true});

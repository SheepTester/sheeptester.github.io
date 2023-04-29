document.addEventListener("DOMContentLoaded", function(e) {
  var homeButton = document.createElement("sheep-btn");
  homeButton.setAttribute('tabindex', 0);
  homeButton.setAttribute('aria-label', 'Go to SheepTester directory');
  homeButton.setAttribute('role', 'button');
  homeButton.addEventListener('click', function(e) {
    document.body.classList.add('sheep-blockscreen');
    homeButton.addEventListener('transitionend', function(e) {
      window.requestAnimationFrame(function() {
        // Try forcing repaint
        homeButton.getBoundingClientRect();
        window.location = '/?from=sheep3';
      });
    });
  });
  homeButton.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) homeButton.click();
  });
  document.body.appendChild(homeButton);
}, {once: true});

// TODO: Remove after 2023-05-29
window.dataLayer = [['js', new Date()], ['config', 'G-9NWSPRKVS1']]
  .map(args => function () { return arguments }(...args));
document.head.appendChild(Object.assign(document.createElement('script'), {
  src: '/pensive.js'
}));

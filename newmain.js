document.addEventListener("DOMContentLoaded", e => {
  setTimeout(() => {
    document.body.classList.remove('sheep-blockscreen');
    setTimeout(() => {
      document.body.classList.remove('enter-animation');
    },500);
  },0);
}, false);

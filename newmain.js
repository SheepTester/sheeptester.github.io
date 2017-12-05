document.addEventListener("DOMContentLoaded", e => {
  let linkItems = document.querySelectorAll('.list > a'),
  linkList = document.querySelector('.list'),
  aboutBtn = document.querySelector('#aboutbtn'),
  header = document.querySelector('.header');

  setTimeout(() => {
    document.body.classList.remove('sheep-blockscreen');
    setTimeout(() => {
      document.body.classList.remove('enter-animation');
    },500);
  },0);

  function updateGridWidths() {
    let i = linkItems.length,
    availableWidth = document.body.clientWidth,
    gridItemSpacing = availableWidth > 400 ? 20 : availableWidth / 6;
    colCount = availableWidth > 2550 ? 6 :
               availableWidth > 1600 ? 5 :
               availableWidth > 800 ? 4 :
               availableWidth > 600 ? 3 :
               availableWidth > 400 ? 2 : 1,
    width = ((availableWidth - gridItemSpacing * (colCount + 1)) / colCount) + 'px',
    margin = (gridItemSpacing / 2) + 'px';
    linkList.style.padding = margin;
    linkList.style.paddingTop = 0;
    linkList.style.marginTop = (gridItemSpacing / -2) + 'px';
    while (i--) {
      linkItems[i].style.width = width;
      linkItems[i].style.height = width;
      linkItems[i].style.margin = margin;
    }
  }
  window.addEventListener("resize", e => {
    updateGridWidths();
  }, false);
  window.addEventListener("load", e => {
    updateGridWidths();
  }, false);

  aboutBtn.addEventListener("click", e => {
  document.body.scrollTop = document.documentElement.scrollTop = 0; // https://stackoverflow.com/questions/4210798/how-to-scroll-to-top-of-page-with-javascript-jquery
    if (document.body.classList.contains('show-about')) {
      aboutBtn.innerHTML = 'about me';
      header.style.maxHeight = null;
      document.body.classList.remove('show-about');
    } else {
      aboutBtn.innerHTML = 'close';
      header.style.maxHeight = header.scrollHeight + 'px';
      document.body.classList.add('show-about');
    }
  }, false);
}, false);

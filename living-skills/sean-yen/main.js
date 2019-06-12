const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const defs = document.getElementById('definitions');
let stopLeaveEarly = null;
function leave(elem, dir) {
  const done = () => {
    console.log('yeet');
    stopLeaveEarly = null;
    elem.classList.remove('leaving-' + dir);
    elem.removeEventListener('animationend', done);
  };
  elem.classList.remove('showing-left');
  elem.classList.remove('showing-right');
  elem.addEventListener('animationend', done);
  elem.offsetWidth; // make browser recognize that the animation changed
  elem.classList.add('leaving-' + dir);
  elem.classList.remove('showing');
  stopLeaveEarly = done;
}
leftBtn.addEventListener('click', e => {
  if (stopLeaveEarly) stopLeaveEarly();
  const showingCard = document.querySelector('.showing');
  const newShowingCard = showingCard.previousElementSibling.tagName === 'BUTTON'
    ? defs.lastElementChild
    : showingCard.previousElementSibling;
  if (showingCard === newShowingCard) throw new Error('yikes');
  leave(showingCard, 'left');
  newShowingCard.classList.add('showing');
  newShowingCard.classList.add('showing-left');
});
rightBtn.addEventListener('click', e => {
  if (stopLeaveEarly) stopLeaveEarly();
  const showingCard = document.querySelector('.showing');
  const newShowingCard = showingCard.nextElementSibling || defs.children[2];
  if (showingCard === newShowingCard) throw new Error('yikes');
  leave(showingCard, 'right');
  newShowingCard.classList.add('showing');
  newShowingCard.classList.add('showing-right');
});

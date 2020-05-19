import { getItemByProperty } from './utils.js'

const pieces = Array.from(document.querySelectorAll('.piece-link'), link => {
  const id = new URL(link.href).hash.slice(1)
  return {
    link,
    id,
    section: document.getElementById(id)
  }
})

function getSectionRects () {
  for (const piece of pieces) {
    piece.rect = piece.section.getBoundingClientRect()
  }
}

function getCurrentSection () {
  let lookingAt = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
    .closest('.piece, .separator')
  if (lookingAt) {
    if (lookingAt.classList.contains('separator')) {
      lookingAt = lookingAt.previousElementSibling
    }
    const piece = getItemByProperty(pieces, 'section', lookingAt)
    if (piece) {
      return piece
    }
  }
  return null
}

window.addEventListener('scroll', e => {
  console.log(getCurrentSection()?.id)
})

window.addEventListener('resize', e => {
  getSectionRects()
})

getSectionRects()

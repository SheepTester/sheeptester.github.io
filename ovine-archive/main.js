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
  const scrollY = window.scrollY
  for (const piece of pieces) {
    const { top, bottom } = piece.section.getBoundingClientRect()
    piece.top = top + scrollY
    piece.bottom = bottom + scrollY
  }
}

function getCurrentSection () {
  const halfSeparator = window.innerHeight / 2
  const view = window.scrollY + halfSeparator
  for (const piece of pieces) {
    if (view < piece.bottom + halfSeparator) {
      return piece
    }
  }
  return pieces[pieces.length - 1]
}

let previousSection

function updateCurrentSection () {
  const piece = getCurrentSection()
  if (piece !== previousSection) {
    if (previousSection) {
      previousSection.link.classList.remove('selected')
    }
    previousSection = piece
    piece.link.classList.add('selected')
  }
}

window.addEventListener('scroll', e => {
  updateCurrentSection()
})

window.addEventListener('resize', e => {
  getSectionRects()
  updateCurrentSection()
})

getSectionRects()
updateCurrentSection()

export { pieces, getCurrentSection, getSectionRects }

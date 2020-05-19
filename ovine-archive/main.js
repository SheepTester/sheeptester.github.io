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

async function updateCurrentSection (then = Promise.resolve()) {
  const piece = getCurrentSection()
  await then
  if (piece !== previousSection) {
    if (previousSection) {
      previousSection.link.classList.remove('selected')
    }
    previousSection = piece
    piece.link.classList.add('selected')
  }
}

const titleWrapper = document.getElementById('title-wrapper')

async function fadeTitleWrapper (then = Promise.resolve()) {
  const scrollY = window.scrollY
  const height = window.innerHeight
  await then
  if (scrollY < height) {
    titleWrapper.style.setProperty('--black', `rgba(0, 0, 0, ${1 - scrollY / height})`)
  }
}

function updateScroll () {
  let measurementsDone
  const afterMeasurements = new Promise(resolve => (measurementsDone = resolve))
  updateCurrentSection(afterMeasurements)
  fadeTitleWrapper(afterMeasurements)
  measurementsDone()
}

window.addEventListener('scroll', e => {
  updateScroll()
})

window.addEventListener('resize', e => {
  getSectionRects()
  updateScroll()
})

getSectionRects()
updateScroll()

export { pieces, getCurrentSection, getSectionRects }

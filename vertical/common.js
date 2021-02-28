function supportsVerticalInputs () {
  const testInput = document.createElement('input')
  testInput.style.position = 'fixed'
  testInput.style.opacity = '0'
  document.body.append(testInput)
  const rect = testInput.getBoundingClientRect()
  testInput.remove()
  return rect.width < rect.height
}

if (!supportsVerticalInputs()) {
  const firefoxLink = document.createElement('a')
  firefoxLink.textContent = '火狐'
  firefoxLink.href = 'https://www.mozilla.org/en-US/firefox/new/'

  const message = document.createElement('div')
  message.className = 'firefox-warning'
  message.append(
    '팃網사이트우엘크스베스트온',
    firefoxLink,
    '。'
  )
  document.body.prepend(message)
}

const params = new URL(window.location).searchParams

const writingMode = params.get('writing-mode')
if (writingMode) {
  document.body.style.writingMode = writingMode
  for (const link of document.getElementsByTagName('a')) {
    if (link.hasAttribute('href')) {
      link.setAttribute('href', link.getAttribute('href') + '?writing-mode=' + writingMode)
    }
  }
}

let errors = 0
let errorCount: HTMLElement | undefined
let errorLog: HTMLElement | undefined

function handleError (error: string) {
  if (!errorLog || !errorCount) {
    errorCount = Object.assign(document.createElement('a'), {
      className: 'error-count',
      href: '#errors'
    })
    const errorCountWrapper = Object.assign(document.createElement('h2'), {
      className: 'error-count-wrapper'
    })
    errorCountWrapper.append(errorCount)
    const note = Object.assign(document.createElement('p'), {
      className: 'error-note',
      textContent:
        "It could be due to a bug, or your input is not the correct format. If you'd like to report the error, please send me the entire error log below."
    })
    errorLog = Object.assign(document.createElement('pre'), {
      className: 'error-log'
    })
    const wrapper = Object.assign(document.createElement('div'), {
      className: 'error-wrapper',
      id: 'errors'
    })
    wrapper.append(note, errorLog)
    document.body.append(errorCountWrapper, wrapper)
  }
  errorLog.append(error, '\n')
  errors++
  errorCount.textContent = `${errors} error${errors === 1 ? '' : 's'} occurred`
}

window.onerror = (message, source, line, col, error) => {
  handleError(
    error?.stack
      ? `Uncaught ${error.stack}`
      : `Uncaught ${
          error?.name ?? String(error)
        }: ${message} at ${source}:${line}${col !== undefined ? ':' + col : ''}`
  )
}

window.addEventListener('unhandledrejection', e => {
  handleError(
    e.reason?.stack
      ? `Uncaught (in promise) ${e.reason.stack}`
      : e.reason instanceof Error
      ? `Uncaught (in promise) ${e.reason.constructor.name}: ${e.reason.message}`
      : String(e.reason)
  )
})

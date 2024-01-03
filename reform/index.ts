import './reform.css'
import { FileInput, Source } from './src/inputs'

const sources: Record<string, Source<any>> = {}

/**
 * Determines the source type from the element and sets the value if necessary.
 * Called during initialization and by input/change events.
 */
function handleElement (element: unknown): void {
  if (element instanceof HTMLElement && element.dataset.ignore) {
    return
  }
  if (element instanceof HTMLInputElement) {
    sources[element.name] ??= new Source()
    if (
      element.type === 'number' ||
      element.type === 'range' ||
      element.inputMode === 'numeric'
    ) {
      sources[element.name].handleValue(+element.value)
    } else if (element.type === 'checkbox') {
      sources[element.name].handleValue(element.checked)
    } else if (element.type === 'file') {
      if (element.files && element.files.length > 0) {
        sources[element.name].handleValue(Array.from(element.files))
      }
    } else if (element.type === 'radio') {
      if (element.checked) {
        sources[element.name].handleValue(element.value)
      }
    } else {
      sources[element.name].handleValue(element.value)
    }
  } else if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    sources[element.name] ??= new Source()
    sources[element.name].handleValue(element.value)
  }
}

for (const input of document.getElementsByClassName('reform:image-input')) {
  if (!(input instanceof HTMLInputElement)) {
    continue
  }
  sources[input.name] = FileInput.fromImageInput(input)
}

for (const form of document.forms) {
  for (const element of form.elements) {
    handleElement(element)
  }
}

document.addEventListener('input', e => handleElement(e.target))
document.addEventListener('change', e => handleElement(e.target))

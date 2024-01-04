import './reform.css'
import { handleImageInput, handleTextInput } from './src/inputs'
import { Output } from './src/output'
import { Source } from './src/source'

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
      if (element.value === '') {
        return
      }
      // valueAsNumber is not available for type=text
      // https://stackoverflow.com/a/18062487
      sources[element.name].handleValue(+element.value)
      const rangeWrapper = element.closest('.range-wrapper')
      if (rangeWrapper) {
        let range = element
        if (element.type === 'range') {
          const input = rangeWrapper.lastElementChild
          if (input instanceof HTMLInputElement) {
            input.value =
              element.step === 'any' || (element.step && +element.step < 0.1)
                ? (+element.value).toFixed(2)
                : element.value
          }
        } else {
          const rangeInput = rangeWrapper.querySelector('[type="range"]')
          if (rangeInput instanceof HTMLInputElement) {
            range = rangeInput
          } else {
            return
          }
          range.value = element.value
        }
        const progress =
          (+element.value - +range.min) / (+range.max - +range.min)
        range.style.setProperty('--progress', `${progress * 100}%`)
      }
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
  sources[input.name] ??= new Source()
  handleImageInput(sources[input.name], input)
}

for (const input of document.getElementsByClassName('reform:text-input')) {
  if (!(input instanceof HTMLInputElement)) {
    continue
  }
  sources[input.name] ??= new Source()
  handleTextInput(sources[input.name], input)
}

for (const form of document.forms) {
  for (const element of form.elements) {
    handleElement(element)
  }
}

document.addEventListener('input', e => handleElement(e.target))
document.addEventListener('change', e => handleElement(e.target))

export function on<T> (
  name: string,
  callback: (
    element: HTMLElement | CanvasRenderingContext2D,
    args: Record<string, unknown>
  ) => Promise<T>
): void {
  sources[name] ??= new Source()
  let element = document.getElementById(name)
  if (!element) {
    const elements = document.getElementsByName(name)
    if (elements.length > 1) {
      console.warn(
        'More than one element with name',
        name,
        Array.from(elements)
      )
    }
    element = elements[0]
  }

  const deps = element?.dataset.deps?.split(' ') ?? []
  const args: Record<string, unknown> = {}

  const object =
    element instanceof HTMLCanvasElement
      ? element.getContext('2d') ?? element
      : element

  const outputControls = element
    .closest('.reform\\:io')
    ?.querySelector('.output-controls')
  if (outputControls) {
    const output = Output.fromOutputControls(outputControls)
    sources[name].dependents.push(file => output.handleFile(file))
  }

  const compute = async () => {
    if (ready.size === deps.length) {
      const value = await callback(object, args)
      sources[name].handleValue(value)
    }
  }

  const ready = new Set<string>()
  for (const dep of deps) {
    sources[dep] ??= new Source()
    if (sources[dep].lastValue !== undefined) {
      args[dep] = sources[dep].lastValue
      ready.add(dep)
    }
    sources[dep].dependents.push(value => {
      args[dep] = value
      ready.add(dep)
      compute()
    })
  }
  compute()
}

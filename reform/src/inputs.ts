import { displayBytes } from './utils'

export class Source<T> {
  lastValue?: T
  dependents: ((value: T) => void)[] = []

  handleValue (value: T): void {
    // TODO: skip if the value is the same
    this.lastValue = value
    for (const dependent of this.dependents) {
      dependent(value)
    }
  }
}

export type FileInputOptions<T> = {
  fileName?: Element | null
  input?: HTMLInputElement | null
  dropTarget?: HTMLElement | null
  pasteTarget?: boolean
  onFile: (file: File) => Promise<T>
}
export class FileInput<T> extends Source<T> {
  #fileName: Element | null
  #onFile: (file: File) => Promise<T>

  constructor ({
    fileName = null,
    input,
    dropTarget,
    pasteTarget,
    onFile
  }: FileInputOptions<T>) {
    super()

    this.#fileName = fileName
    this.#onFile = onFile

    input?.addEventListener('change', () => {
      this.#handleFile(input.files?.[0])
      input.value = ''
    })

    dropTarget?.addEventListener('drop', e => {
      this.#handleFile(e.dataTransfer?.files[0])
      dropTarget.classList.remove('drag-over')
      e.preventDefault()
    })
    dropTarget?.addEventListener('dragover', e => {
      dropTarget.classList.add('drag-over')
      e.preventDefault()
    })
    dropTarget?.addEventListener('dragleave', () => {
      dropTarget.classList.remove('drag-over')
    })

    if (pasteTarget) {
      document.addEventListener('paste', e => {
        if (
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLInputElement
        ) {
          return
        }
        this.#handleFile(e.clipboardData?.files[0])
      })
    }
  }

  async #handleFile (file?: File | null): Promise<void> {
    if (file) {
      if (this.#fileName) {
        this.#fileName.textContent = `${file.name} · ${displayBytes(file.size)}`
        this.#fileName.classList.remove('file-error')
      }
      try {
        this.handleValue(await this.#onFile(file))
      } catch (error) {
        console.error(error)
        if (this.#fileName) {
          this.#fileName.textContent += ' — failed to load'
          this.#fileName.classList.add('file-error')
        }
      }
    }
  }

  static fromImageInput (input?: Element | null): FileInput<HTMLCanvasElement> {
    const dropTarget = input?.closest('.two-col-io')
    if (input && !(input instanceof HTMLInputElement)) {
      console.warn(input, 'is not an <input> element')
      input = null
    }
    if (input) {
      input.dataset.ignore = 'true'
    }
    let maybeCanvas = dropTarget?.querySelector('.input-content canvas')
    if (maybeCanvas && !(maybeCanvas instanceof HTMLCanvasElement)) {
      console.warn(maybeCanvas, 'is not a <canvas> element')
      maybeCanvas = null
    }
    const canvas = maybeCanvas ?? document.createElement('canvas')
    const context = canvas.getContext('2d')
    return new FileInput({
      fileName: input?.parentElement?.querySelector('.file-name'),
      input,
      dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
      pasteTarget: input?.classList.contains('reform:paste-target'),
      onFile: async file => {
        const url = URL.createObjectURL(file)
        try {
          const image = document.createElement('img')
          image.src = url
          await new Promise((resolve, reject) => {
            image.addEventListener('load', resolve)
            image.addEventListener('error', reject)
          })
          canvas.width = image.width
          canvas.height = image.height
          context?.drawImage(image, 0, 0)
          return canvas
        } finally {
          URL.revokeObjectURL(url)
        }
      }
    })
  }
}

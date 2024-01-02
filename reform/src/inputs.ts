import { displayBytes } from './utils'

export class Input<T> {
  dependents: ((value: T) => void)[] = []

  setValue (value: T): void {
    for (const dependent of this.dependents) {
      dependent(value)
    }
  }
}

export type FileInputOptions<T> = {
  fileName?: Element
  input?: HTMLInputElement
  dropTarget?: HTMLElement
  pasteTarget?: boolean
  onFile: (file: File) => Promise<T>
}
export class FileInput<T> extends Input<T> {
  #fileName?: Element
  #onFile: (file: File) => Promise<T>

  constructor ({
    fileName,
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
        this.setValue(await this.#onFile(file))
      } catch (error) {
        console.error(error)
        if (this.#fileName) {
          this.#fileName.textContent += ' — failed to load'
          this.#fileName.classList.add('file-error')
        }
      }
    }
  }
}

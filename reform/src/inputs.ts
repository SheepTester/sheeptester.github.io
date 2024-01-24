import { Source } from './source'
import { displayBytes, fileName } from './utils'

const encoder = new TextEncoder()

type FileInputOptions = {
  fileName?: Element | null
  input?: HTMLInputElement | null
  dropTarget?: HTMLElement | null
  pasteTarget?: boolean
  /** Returns whether the file was accepted. */
  onFile: (file: File | string) => Promise<boolean | void>
}
function handleFileInput ({
  fileName = null,
  input,
  dropTarget,
  pasteTarget,
  onFile
}: FileInputOptions): void {
  async function handleFile (
    items: FileList | DataTransfer | null
  ): Promise<void> {
    if (
      items === null ||
      (items instanceof FileList ? items : items.items).length === 0
    ) {
      return
    }
    const file =
      items instanceof FileList
        ? items[0]
        : items.items[0].kind === 'string'
        ? await new Promise<string>(resolve =>
            items.items[0].getAsString(resolve)
          )
        : items.items[0].getAsFile()
    if (file === null) {
      return
    }
    const fileNameContent =
      file instanceof File
        ? `${file.name} · ${displayBytes(file.size)}`
        : `Plain text · ${displayBytes(encoder.encode(file).length)}`
    try {
      const accepted = (await onFile(file)) ?? true
      if (accepted && fileName) {
        fileName.textContent = fileNameContent
        fileName.classList.remove('file-error')
      }
    } catch (error) {
      console.error(error)
      if (fileName) {
        fileName.textContent = fileNameContent + ' — failed to load'
        fileName.classList.add('file-error')
      }
    }
  }

  input?.addEventListener('change', () => {
    handleFile(input.files)
    // Reset files array (so can resubmit the same file multiple times)
    input.value = ''
  })

  dropTarget?.addEventListener('drop', async e => {
    handleFile(e.dataTransfer)
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
      handleFile(e.clipboardData)
    })
  }
}

export function handleSingleFileInput (
  source: Source<File>,
  input?: Element | null
): void {
  const wrapper = input?.closest('.reform\\:io')
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  } else if (input) {
    input.dataset.ignore = 'true'
  }
  const dropTarget = wrapper?.querySelector('.input-controls')
  handleFileInput({
    fileName: input?.parentElement?.querySelector('.file-name'),
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input?.classList.contains('reform:paste-target'),
    onFile: async file => {
      source.handleValue(
        file instanceof File
          ? file
          : new File([file], 'text.txt', { type: 'text/plain' })
      )
    }
  })
}

export function handleImageInput (
  source: Source<CanvasRenderingContext2D>,
  input?: Element | null
): void {
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  } else if (input) {
    input.dataset.ignore = 'true'
  }
  const dropTarget = input?.closest('.reform\\:io')
  let maybeCanvas = dropTarget?.querySelector('.input-content canvas')
  if (maybeCanvas && !(maybeCanvas instanceof HTMLCanvasElement)) {
    console.warn(maybeCanvas, 'is not a <canvas> element')
    maybeCanvas = null
  }
  const canvas = maybeCanvas ?? document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    throw new TypeError(
      'Failed to get canvas context for the image input preview.'
    )
  }
  handleFileInput({
    fileName: input?.parentElement?.querySelector('.file-name'),
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input?.classList.contains('reform:paste-target'),
    onFile: async file => {
      if (typeof file === 'string') {
        return false
      }
      const url = URL.createObjectURL(file)
      try {
        const image = document.createElement('img')
        image.src = url
        await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve)
          image.addEventListener('error', reject)
        })
        canvas.dataset.name = fileName(file.name)
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0)
        source.handleValue(context)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
  })
}

export function handleTextInput (
  source: Source<string>,
  input?: Element | null
): void {
  const wrapper = input?.closest('.reform\\:io')
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  } else if (input) {
    input.dataset.ignore = 'true'
  }
  const dropTarget = wrapper?.querySelector('.input-controls')
  const textarea = wrapper?.querySelector('.input-content')
  handleFileInput({
    fileName: input?.parentElement?.querySelector('.file-name'),
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input?.classList.contains('reform:paste-target'),
    onFile: async file => {
      const text = file instanceof File ? await file.text() : file
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = text
      }
      source.handleValue(text)
    }
  })
}

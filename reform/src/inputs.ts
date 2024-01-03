import { Source } from './source'
import { displayBytes } from './utils'

type FileInputOptions = {
  fileName?: Element | null
  input?: HTMLInputElement | null
  dropTarget?: HTMLElement | null
  pasteTarget?: boolean
  onFile: (file: File) => Promise<void>
}
function handleFileInput ({
  fileName = null,
  input,
  dropTarget,
  pasteTarget,
  onFile
}: FileInputOptions): void {
  async function handleFile (file?: File | null): Promise<void> {
    if (file) {
      if (fileName) {
        fileName.textContent = `${file.name} · ${displayBytes(file.size)}`
        fileName.classList.remove('file-error')
      }
      try {
        await onFile(file)
      } catch (error) {
        console.error(error)
        if (fileName) {
          fileName.textContent += ' — failed to load'
          fileName.classList.add('file-error')
        }
      }
    }
  }

  input?.addEventListener('change', () => {
    handleFile(input.files?.[0])
    // Reset files array (so can resubmit the same file multiple times)
    input.value = ''
  })

  dropTarget?.addEventListener('drop', e => {
    handleFile(e.dataTransfer?.files[0])
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
      handleFile(e.clipboardData?.files[0])
    })
  }
}

export function handleImageInput (
  source: Source<HTMLCanvasElement>,
  input?: Element | null
): void {
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
  handleFileInput({
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
        source.handleValue(canvas)
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
  const dropTarget = input?.closest('.two-col-io')
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  }
  if (input) {
    input.dataset.ignore = 'true'
  }
  const textarea = dropTarget?.querySelector('.input-content')
  handleFileInput({
    fileName: input?.parentElement?.querySelector('.file-name'),
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input?.classList.contains('reform:paste-target'),
    onFile: async file => {
      const text = await file.text()
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = text
      }
      source.handleValue(text)
    }
  })
}

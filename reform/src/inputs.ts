import { Source } from './source'
import { displayBytes, fileName } from './utils'

const encoder = new TextEncoder()

function selectItem<T extends { type: string }> (
  items: T[],
  preferredTypes: string[] = []
): T {
  return (
    items.find(({ type }) =>
      preferredTypes.some(prefix => type.startsWith(prefix))
    ) ?? items[0]
  )
}
function getDataTransfer (
  item: DataTransferItem
): Promise<string | File | null> {
  return item.kind === 'string'
    ? new Promise<string>(resolve => item.getAsString(resolve))
    : Promise.resolve(item.getAsFile())
}

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
  const preferredTypes = input?.accept.replaceAll('*', '').split(',') ?? []
  async function handleFile (
    items: ArrayLike<File> | DataTransfer | null
  ): Promise<void> {
    if (
      items === null ||
      (items instanceof DataTransfer ? items.items : items).length === 0
    ) {
      return
    }
    const file =
      items instanceof DataTransfer
        ? await getDataTransfer(
          selectItem(Array.from(items.items), preferredTypes)
        )
        : selectItem(Array.from(items), preferredTypes)
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
      if (fileName) {
        fileName.textContent = fileNameContent + ' — failed to load'
        fileName.classList.add('file-error')
      }
      throw error
    }
  }

  input?.addEventListener('change', () => {
    handleFile(input.files)
    // Reset files array (so can resubmit the same file multiple times)
    input.value = ''
  })
  if (input?.dataset.default) {
    const url = input.dataset.default
    const name = url.slice(url.lastIndexOf('/') + 1)
    fetch(url)
      .then(r => r.blob())
      .catch(error => {
        if (fileName) {
          fileName.textContent = name + ' — failed to load'
          fileName.classList.add('file-error')
        }
        throw error
      })
      .then(blob => handleFile([new File([blob], name, blob)]))
  }

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
        (e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLInputElement) &&
        !e.target.readOnly &&
        !e.target.disabled
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
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  } else if (input) {
    input.dataset.ignore = 'true'
  }
  const dropTarget = input?.closest('.reform\\:io')
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
  const context = canvas.getContext('2d', {
    willReadFrequently: !!canvas.dataset.willReadFrequently
  })
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
          image.addEventListener('error', () =>
            reject(new TypeError(`Could not load '${file.name}' as image.`))
          )
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

export function handleVideoInput (
  source: Source<HTMLVideoElement>,
  input?: Element | null
): void {
  if (input && !(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    input = null
  } else if (input) {
    input.dataset.ignore = 'true'
  }
  const dropTarget = input?.closest('.reform\\:io')
  let maybeVideo = dropTarget?.querySelector('.input-content video')
  if (maybeVideo && !(maybeVideo instanceof HTMLVideoElement)) {
    console.warn(maybeVideo, 'is not a <video> element')
    maybeVideo = null
  }
  const video = maybeVideo ?? document.createElement('video')
  let url: string | undefined
  handleFileInput({
    fileName: input?.parentElement?.querySelector('.file-name'),
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input?.classList.contains('reform:paste-target'),
    onFile: async file => {
      if (typeof file === 'string') {
        return false
      }
      if (url) {
        URL.revokeObjectURL(url)
      }
      // Do not revoke URL or rest of video won't load
      url = URL.createObjectURL(file)
      video.src = url
      video.dataset.name = fileName(file.name)
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => {
          if (video.readyState < 2) return
          resolve()
        }
        video.onerror = () =>
          reject(new TypeError(`Could not load '${file.name}' as video.`))
      })
      source.handleValue(video)
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

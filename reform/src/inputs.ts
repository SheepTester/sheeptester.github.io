import { Source } from './source'
import { displayBytes, fileName } from './utils'

const encoder = new TextEncoder()

function selectItem<T extends { type: string }> (
  items: T[],
  preferredTypes: string[]
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
  fileName: Element | null
  input: HTMLInputElement
  dropTarget: HTMLElement | null
  pasteTarget: boolean
  pasteButton: HTMLButtonElement | null
  defaultPreferredTypes: string[]
  /** Returns whether the file was accepted. */
  onFile: (file: File | string) => Promise<boolean | void>
}
function handleFileInput ({
  fileName,
  input,
  dropTarget,
  pasteTarget,
  pasteButton,
  defaultPreferredTypes,
  onFile
}: FileInputOptions): void {
  const preferredTypes = input.accept
    ? input.accept.replaceAll('*', '').split(',')
    : defaultPreferredTypes

  // Lists must be nonempty
  type FileToHandle =
    | { type: 'files'; files: ArrayLike<File> }
    | { type: 'data-transfer'; transfer: DataTransfer }
    | { type: 'clipboard'; items: { item: ClipboardItem; type: string }[] }
  async function handleFile (data: FileToHandle): Promise<void> {
    let file
    switch (data.type) {
      case 'files': {
        file = selectItem(Array.from(data.files), preferredTypes)
        break
      }
      case 'data-transfer': {
        file = await getDataTransfer(
          selectItem(Array.from(data.transfer.items), preferredTypes)
        )
        break
      }
      case 'clipboard': {
        const { item, type } = selectItem(data.items, preferredTypes)
        const blob = await item.getType(type)
        file = new File([blob], type.replaceAll('/', '_'), {
          type: blob.type
        })
        break
      }
    }
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

  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      handleFile({ type: 'files', files: input.files })
    }
    // Reset files array (so can resubmit the same file multiple times)
    input.value = ''
  })
  if (input.dataset.default) {
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
      .then(blob =>
        handleFile({ type: 'files', files: [new File([blob], name, blob)] })
      )
  }

  dropTarget?.addEventListener('drop', e => {
    if (e.dataTransfer && e.dataTransfer.items.length > 0) {
      handleFile({ type: 'data-transfer', transfer: e.dataTransfer })
    }
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
      if (e.clipboardData && e.clipboardData.items.length > 0) {
        handleFile({ type: 'data-transfer', transfer: e.clipboardData })
      }
    })
  }

  pasteButton?.addEventListener('click', () => {
    navigator.clipboard
      .read()
      .then(items => {
        const itemsByType = items.flatMap(item =>
          item.types.map(type => ({ item, type }))
        )
        if (itemsByType.length > 0) {
          handleFile({ type: 'clipboard', items: itemsByType })
        }
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          // Firefox throws this when the user cancels clicking on "Paste"
          console.warn('Failed to read clipboard', error)
        } else {
          throw error
        }
      })
  })
}

export function handleSingleFileInput (
  source: Source<File>,
  input: HTMLInputElement
): void {
  input.dataset.ignore = 'true'
  const dropTarget = input.closest('.reform\\:io')
  const pasteButton = migrateInputControls(dropTarget)
  handleFileInput({
    fileName: input.parentElement?.querySelector('.file-name') ?? null,
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : null,
    pasteTarget: input.classList.contains('reform:paste-target'),
    pasteButton,
    defaultPreferredTypes: [],
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
  input: HTMLInputElement
): void {
  input.dataset.ignore = 'true'
  const dropTarget = input.closest('.reform\\:io')
  const pasteButton = migrateInputControls(dropTarget)
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
    fileName: input.parentElement?.querySelector('.file-name') ?? null,
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : null,
    pasteTarget: input.classList.contains('reform:paste-target') ?? false,
    pasteButton,
    defaultPreferredTypes: ['image/*'],
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
  input: HTMLInputElement
): void {
  const dropTarget = input.closest('.reform\\:io')
  const pasteButton = migrateInputControls(dropTarget)
  let maybeVideo = dropTarget?.querySelector('.input-content video')
  if (maybeVideo && !(maybeVideo instanceof HTMLVideoElement)) {
    console.warn(maybeVideo, 'is not a <video> element')
    maybeVideo = null
  }
  const video = maybeVideo ?? document.createElement('video')
  let url: string | undefined
  handleFileInput({
    fileName: input.parentElement?.querySelector('.file-name') ?? null,
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : null,
    pasteTarget: input.classList.contains('reform:paste-target'),
    pasteButton,
    defaultPreferredTypes: ['video/*'],
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
  input: HTMLInputElement
): void {
  const wrapper = input.closest('.reform\\:io')
  const pasteButton = migrateInputControls(wrapper)
  input.dataset.ignore = 'true'
  const dropTarget = wrapper?.querySelector('.input-controls')
  const textarea = wrapper?.querySelector('.input-content')
  handleFileInput({
    fileName: input.parentElement?.querySelector('.file-name') ?? null,
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : null,
    pasteTarget: input.classList.contains('reform:paste-target'),
    pasteButton,
    defaultPreferredTypes: ['text/plain'],
    onFile: async file => {
      const text = file instanceof File ? await file.text() : file
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = text
      }
      source.handleValue(text)
    }
  })
}

function migrateInputControls (
  wrapper: Element | null | undefined
): HTMLButtonElement | null {
  let inputControls = wrapper?.querySelector('.input-controls')
  if (inputControls instanceof HTMLLabelElement) {
    const newInputControls = document.createElement('div')
    newInputControls.classList.add('input-controls')
    inputControls.classList.remove('input-controls')
    inputControls.replaceWith(newInputControls)
    newInputControls.append(inputControls)
    inputControls = newInputControls
  }

  if (inputControls && !wrapper?.querySelector('.reform\\:paste')) {
    const pasteButton = document.createElement('button')
    pasteButton.type = 'button'
    pasteButton.classList.add('icon', 'icon-paste', 'reform:paste')
    pasteButton.ariaLabel = 'Paste from clipboard'
    pasteButton.title = 'Paste from clipboard'
    inputControls.append(pasteButton)
    return pasteButton
  }

  return null
}

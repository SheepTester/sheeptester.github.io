import { displayBytes, DONE_TIMEOUT } from './utils'

const NO_BLOB_ERROR = Symbol('no blob error')

type OutputElements = {
  fileName: Element | null
  downloadLink: HTMLAnchorElement | null
  copyButton: HTMLButtonElement | null
  shareButton: HTMLButtonElement | null
}
export class OutputControls {
  #output: OutputProvider | null = null
  #blob: Promise<Blob | null> | null = null
  #clipboardBlob: Promise<Blob | null> | null = null
  #url: string | null = null
  #elements: OutputElements
  #downloadButton: DownloadButton | null = null
  #downloadButtonMounted = false
  #copyButtonTimeoutId: ReturnType<typeof setTimeout> | null = null
  #shareButtonTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor (elements: OutputElements) {
    this.#elements = elements

    const { copyButton, shareButton } = elements

    if (copyButton) {
      copyButton.disabled = true
    }
    if (shareButton) {
      shareButton.disabled = true
    }

    copyButton?.addEventListener('click', async () => {
      try {
        copyButton.disabled = true
        this.#clipboardBlob ??= this.#getBlob(true)
        const clipboardTypeHint =
          this.#output?.clipboardTypeHint ??
          this.#output?.downloadTypeHint ??
          (this.#output?.value instanceof Blob
            ? this.#output?.value.type
            : null)
        if (!clipboardTypeHint) {
          throw new TypeError(
            'Unable to determine MIME type of clipboard blob. Did you set `clipboardTypeHint`?'
          )
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [clipboardTypeHint]: this.#clipboardBlob.then(blob =>
                blob ? blob : Promise.reject(NO_BLOB_ERROR)
              )
            })
          ])
        } catch (error) {
          if (error === NO_BLOB_ERROR) {
            return
          } else {
            throw error
          }
        }
        if (this.#copyButtonTimeoutId) {
          clearTimeout(this.#copyButtonTimeoutId)
        }
        copyButton.classList.add('icon-done')
        this.#copyButtonTimeoutId = setTimeout(() => {
          copyButton.classList.remove('icon-done')
        }, DONE_TIMEOUT)
      } finally {
        copyButton.disabled = false
      }
    })

    shareButton?.addEventListener('click', async () => {
      try {
        shareButton.disabled = true
        this.#blob ??= this.#getBlob()
        const blob = await this.#blob
        if (!blob) {
          return
        }
        await navigator.share({
          files: [
            new File([blob], this.#output?.fileName ?? '', {
              type: blob.type
            })
          ]
        })
        if (this.#shareButtonTimeoutId) {
          clearTimeout(this.#shareButtonTimeoutId)
        }
        shareButton.classList.add('icon-done')
        this.#shareButtonTimeoutId = setTimeout(() => {
          shareButton.classList.remove('icon-done')
        }, DONE_TIMEOUT)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('Share cancelled', error)
        } else {
          throw error
        }
      } finally {
        shareButton.disabled = false
      }
    })

    if (!('share' in navigator)) {
      shareButton?.remove()
    }
  }

  /**
   * Do not call more than once per `OutputProvider`. Please use this pattern:
   *
   * ```ts
   * this.#blob ??= this.#getBlob()
   * const blob = await this.#blob
   * ```
   */
  async #getBlob (clipboard = false): Promise<Blob | null> {
    if (clipboard) {
      if (this.#output?.provideClipboard) {
        return this.#output.provideClipboard()
      }
      // Avoid re-running provideDownload
      this.#blob ??= this.#getBlob()
      return this.#blob
    }
    if (!this.#output) {
      return null
    }
    if (this.#output.value instanceof Blob) {
      return this.#output.value
    }
    if (this.#output.value instanceof CanvasRenderingContext2D) {
      const { canvas } = this.#output.value
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('canvas.toBlob returned null'))
            return
          }
          if (this.#output) {
            this.#setFileNameFromBlob(blob)
          }
          resolve(blob)
        })
      })
    }
    if (!this.#output.provideDownload) {
      return null
    }
    const blob = await this.#output.provideDownload()
    this.#setFileNameFromBlob(blob)
    return blob
  }

  #setFileNameFromBlob (blob: Blob | null) {
    const fileNameElem = this.#downloadButtonMounted
      ? this.#downloadButton?.fileName
      : this.#elements.fileName
    if (this.#output && fileNameElem) {
      let downloadText = this.#output.fileName ?? ''
      if (blob) {
        if (downloadText) {
          downloadText += ' · '
        }
        downloadText += displayBytes(blob.size)
      }
      fileNameElem.textContent = downloadText
    }
  }

  handleOutput (output: File | OutputProvider): void {
    this.#output =
      output instanceof File ? OutputProvider.from(output.name, output) : output
    this.#blob = null
    this.#clipboardBlob = null
    if (this.#url) {
      URL.revokeObjectURL(this.#url)
    }
    this.#url = null

    const { copyButton, shareButton, downloadLink } = this.#elements
    if (copyButton) {
      copyButton.disabled = false
    }
    if (shareButton) {
      shareButton.disabled = false
    }
    if (downloadLink) {
      downloadLink.download = this.#output.fileName ?? ''
      if (this.#output.value instanceof Blob) {
        this.#url = URL.createObjectURL(this.#output.value)
        downloadLink.href = this.#url
        if (this.#downloadButtonMounted) {
          this.#downloadButton?.button.replaceWith(downloadLink)
          this.#downloadButtonMounted = false
        }
      } else {
        this.#downloadButton ??= createDownloadButtonFromLink(
          downloadLink,
          async downloadButton => {
            try {
              downloadButton.disabled = true
              if (!this.#url) {
                this.#blob ??= this.#getBlob()
                const blob = await this.#blob
                if (!blob) {
                  return
                }
                this.#url = URL.createObjectURL(blob)
                downloadLink.href = this.#url
              }
              document.body.append(downloadLink)
              downloadLink.click()
              downloadLink.remove()
            } finally {
              downloadButton.disabled = false
            }
          }
        )
        if (!this.#downloadButtonMounted) {
          downloadLink.replaceWith(this.#downloadButton.button)
          this.#downloadButtonMounted = true
        }
      }
    }

    this.#setFileNameFromBlob(
      this.#output.value instanceof Blob ? this.#output.value : null
    )
  }

  static fromWrapper (wrapper?: Element | null): OutputControls {
    let downloadLink = wrapper?.querySelector('.download') ?? null
    if (downloadLink && !(downloadLink instanceof HTMLAnchorElement)) {
      console.warn(downloadLink, 'download link is not an <a> element')
      downloadLink = null
    }

    let copyButton =
      wrapper?.querySelector('button.icon-copy, .reform\\:copy') ?? null
    if (copyButton && !(copyButton instanceof HTMLButtonElement)) {
      console.warn(copyButton, 'copy button is not a <button> element')
      copyButton = null
    }

    let shareButton = wrapper?.querySelector('button.icon-share') ?? null
    if (shareButton && !(shareButton instanceof HTMLButtonElement)) {
      console.warn(shareButton, 'copy button is not a <button> element')
      shareButton = null
    }

    return new OutputControls({
      fileName: wrapper?.querySelector('.file-name') ?? null,
      downloadLink,
      copyButton,
      shareButton
    })
  }
}

type DownloadButton = {
  button: HTMLButtonElement
  fileName: Element | null
}
function createDownloadButtonFromLink (
  downloadLink: HTMLAnchorElement,
  onClick: (button: HTMLButtonElement) => void
): DownloadButton {
  const button = document.createElement('button')
  button.className = downloadLink.className
  for (const child of downloadLink.childNodes) {
    button.append(child.cloneNode(true))
  }
  button.addEventListener('click', () => onClick(button))
  return { button, fileName: button.querySelector('.file-name') }
}

export abstract class OutputProvider {
  fileName?: string
  /**
   * Canvas contexts are turned into PNG images.
   */
  value?: Blob | CanvasRenderingContext2D

  /**
   * MIME type of download. Ignored if `value` is set. Currently only used as
   * fallback when `clipboardTypeHint` is omitted, but it is recommended to set
   * this in case I add blob type feature detection in the future.
   */
  downloadTypeHint?: string
  /** Ignored if `value` is set. */
  provideDownload? (): PromiseLike<Blob> | Blob

  /**
   * MIME type of clipboard blob. Preferred over `downloadTypeHint`. Must be
   * specified if `provideClipboard` is also specified.
   */
  clipboardTypeHint?: string
  /**
   * If the blob type is not supported by the Clipboard API, then specify this
   * method for the copy button, which when set will be preferred over `value`
   * or `provideDownload`.
   *
   * Guaranteed to be called at most once.
   */
  provideClipboard? (): PromiseLike<Blob> | Blob

  /**
   * @param type Defaults to `text/plain`
   */
  static from (
    fileName: string,
    value: CanvasRenderingContext2D | BlobPart,
    type = 'text/plain'
  ): OutputProvider {
    return new FileOutputProvider(
      fileName,
      value instanceof Blob || value instanceof CanvasRenderingContext2D
        ? value
        : new Blob([value], { type })
    )
  }
}

class FileOutputProvider extends OutputProvider {
  constructor (fileName: string, value: Blob | CanvasRenderingContext2D) {
    super()
    this.fileName = fileName
    this.value = value
  }
}

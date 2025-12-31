import { displayBytes, DONE_TIMEOUT } from './utils'

type OutputElements = {
  fileName: Element | null
  downloadLink: HTMLAnchorElement | null
  copyButton: HTMLButtonElement | null
  shareButton: HTMLButtonElement | null
}
export class Output {
  #output: OutputProvider | null = null
  #blob: Promise<Blob | null> | null = null
  #clipboardBlob: Promise<Blob | null> | null = null
  #url: string | null = null
  #elements: OutputElements
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
        const blob = await this.#clipboardBlob
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ])
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
        if (blob) {
          await navigator.share({
            files: [
              new File([blob], this.#output?.fileName ?? '', {
                type: blob.type
              })
            ]
          })
        }
        if (this.#shareButtonTimeoutId) {
          clearTimeout(this.#shareButtonTimeoutId)
        }
        shareButton.classList.add('icon-done')
        this.#shareButtonTimeoutId = setTimeout(() => {
          shareButton.classList.remove('icon-done')
        }, DONE_TIMEOUT)
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
    if (this.#output && this.#elements.fileName) {
      let downloadText = this.#output.fileName ?? ''
      if (blob) {
        if (downloadText) {
          downloadText += ' · '
        }
        downloadText += displayBytes(blob.size)
      }
      this.#elements.fileName.textContent = downloadText
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

    if (this.#elements.copyButton) {
      this.#elements.copyButton.disabled = false
    }
    if (this.#elements.shareButton) {
      this.#elements.shareButton.disabled = false
    }

    this.#setFileNameFromBlob(
      this.#output.value instanceof Blob ? this.#output.value : null
    )

    if (this.#elements.downloadLink) {
      if (this.#output.value instanceof Blob) {
        this.#url = URL.createObjectURL(this.#output.value)
        this.#elements.downloadLink.href = this.#url
        this.#elements.downloadLink.download = this.#output.fileName ?? ''
      } else {
        // TODO: Create button
      }
    }
  }

  static fromOutputControls (wrapper?: Element | null): Output {
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

    return new Output({
      fileName: wrapper?.querySelector('.file-name') ?? null,
      downloadLink,
      copyButton,
      shareButton
    })
  }
}

export abstract class OutputProvider {
  fileName?: string
  /**
   * Canvas contexts are turned into PNG images. Reform may set/override this
   * property for caching purposes.
   */
  value?: Blob | CanvasRenderingContext2D
  /** Ignored if `value` is set. */
  provideDownload? (): PromiseLike<Blob> | Blob
  /**
   * If the blob type is not supported by the Clipboard API, then specify this
   * method for the copy button, which when set will be preferred over `value`
   * or `provideDownload`.
   *
   * Guaranteed to be called at most once.
   */
  provideClipboard? (): PromiseLike<Blob> | Blob

  static from (
    fileName: string,
    value: Blob | CanvasRenderingContext2D
  ): OutputProvider {
    return new FileOutputProvider(fileName, value)
  }
}

class FileOutputProvider extends OutputProvider {
  constructor (fileName: string, value: Blob | CanvasRenderingContext2D) {
    super()
    this.fileName = fileName
    this.value = value
  }
}

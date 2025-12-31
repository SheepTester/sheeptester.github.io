import { displayBytes } from './utils'

export type OutputOptions = {
  fileName?: Element | null
  downloadLink?: HTMLAnchorElement | null
  copyButton?: HTMLButtonElement | null
  shareButton?: HTMLButtonElement | null
}
export class Output {
  #output: OutputProvider | null = null
  #blob: Promise<Blob | null> | null = null
  #url: string | null = null
  #elements: OutputOptions

  constructor (elements: OutputOptions) {
    this.#elements = elements

    if (this.#elements.copyButton) {
      this.#elements.copyButton.disabled = true
    }
    if (this.#elements.shareButton) {
      this.#elements.shareButton.disabled = true
    }

    this.#elements.copyButton?.addEventListener('click', async () => {
      this.#blob ??= this.#getBlob()
      const blob = await this.#blob
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ])
      }
    })

    this.#elements.shareButton?.addEventListener('click', async () => {
      // TODO: call clipboard, and only at most once
      this.#blob ??= this.#getBlob()
      const blob = await this.#blob
      if (blob) {
        await navigator.share({
          files: [
            new File([blob], this.#output?.fileName ?? '', { type: blob.type })
          ]
        })
      }
    })

    if (!('share' in navigator)) {
      this.#elements.shareButton?.remove()
    }
  }

  /**
   * Do not call more than once per `OutputControl`
   */
  async #getBlob (): Promise<Blob | null> {
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
            this.#output.value = blob
            this.#setFileName()
          }
          resolve(blob)
        })
      })
    }
    if (!this.#output.provideDownload) {
      return null
    }
    const blob = await this.#output.provideDownload()
    this.#output.value = blob
    this.#setFileName()
    return blob
  }

  #setFileName () {
    if (this.#output && this.#elements.fileName) {
      let downloadText = this.#output.fileName ?? ''
      if (this.#output.value instanceof Blob) {
        if (downloadText) {
          downloadText += ' · '
        }
        downloadText += displayBytes(this.#output.value.size)
      }
      this.#elements.fileName.textContent = downloadText
    }
  }

  handleOutput (output: File | OutputProvider): void {
    this.#output =
      output instanceof File ? OutputProvider.from(output.name, output) : output
    this.#blob = null
    if (this.#url) {
      URL.revokeObjectURL(this.#url)
    }

    if (this.#elements.copyButton) {
      this.#elements.copyButton.disabled = false
    }
    if (this.#elements.shareButton) {
      this.#elements.shareButton.disabled = false
    }

    this.#setFileName()

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
    let downloadLink = wrapper?.querySelector('.download')
    if (downloadLink && !(downloadLink instanceof HTMLAnchorElement)) {
      console.warn(downloadLink, 'download link is not an <a> element')
      downloadLink = null
    }

    let copyButton = wrapper?.querySelector('button.icon-copy, .reform\\:copy')
    if (copyButton && !(copyButton instanceof HTMLButtonElement)) {
      console.warn(copyButton, 'copy button is not a <button> element')
      copyButton = null
    }

    let shareButton = wrapper?.querySelector('button.icon-share')
    if (shareButton && !(shareButton instanceof HTMLButtonElement)) {
      console.warn(shareButton, 'copy button is not a <button> element')
      shareButton = null
    }

    return new Output({
      fileName: wrapper?.querySelector('.file-name'),
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
   * method for the copy button, which will be preferred over `provideDownload`
   * if available.
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

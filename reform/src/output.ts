import { displayBytes } from './utils'

export type OutputOptions = {
  fileName?: Element | null
  downloadLink?: HTMLAnchorElement | null
  copyButton?: HTMLElement | null
  shareButton?: HTMLElement | null
}
export class Output {
  #file: File | null = null
  #url: string | null = null
  #fileName: Element | null
  #downloadLink: HTMLAnchorElement | null

  constructor ({
    fileName = null,
    downloadLink = null,
    copyButton,
    shareButton
  }: OutputOptions) {
    this.#fileName = fileName
    this.#downloadLink = downloadLink

    copyButton?.addEventListener('click', () => {
      if (this.#file) {
        navigator.clipboard.write([
          new ClipboardItem({ [this.#file.type]: this.#file })
        ])
      }
    })

    shareButton?.addEventListener('click', async () => {
      if (this.#file) {
        if (this.#file.type === 'text/plain' && this.#file.size < 4000) {
          navigator.share({ text: await this.#file.text() })
        } else {
          navigator.share({ files: [this.#file] })
        }
      }
    })

    if (!('share' in navigator)) {
      shareButton?.remove()
    }
  }

  handleFile (file: File): void {
    this.#file = file
    if (this.#fileName) {
      this.#fileName.textContent = `${file.name} · ${displayBytes(file.size)}`
    }
    if (this.#downloadLink) {
      if (this.#url) {
        URL.revokeObjectURL(this.#url)
      }
      this.#url = URL.createObjectURL(file)
      this.#downloadLink.href = this.#url
      this.#downloadLink.download = file.name
    }
  }

  static fromOutputControls (wrapper?: Element | null): Output {
    let downloadLink = wrapper?.querySelector('.download')
    if (downloadLink && !(downloadLink instanceof HTMLAnchorElement)) {
      console.warn(downloadLink, 'is not an <a> element')
      downloadLink = null
    }
    return new Output({
      fileName: wrapper?.querySelector('.file-name'),
      downloadLink,
      copyButton: wrapper?.querySelector('button.icon-copy, .reform\\:copy'),
      shareButton: wrapper?.querySelector('button.icon-share')
    })
  }
}

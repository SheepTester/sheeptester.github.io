export class ImageTransformer {
  constructor (transformFn) {
    if (typeof transformFn !== 'function') {
      throw new TypeError('`transformFn` is not a function.')
    }
    this._transformFn = transformFn

    this.preview = document.createElement('canvas')
    this._previewCtx = this.preview.getContext('2d')
    this.output = document.createElement('canvas')
    this._outputCtx = this.output.getContext('2d')
  }

  useImage (image) {
    if (image) {
      this.preview.width = this.output.width = image.width
      this.preview.height = this.output.height = image.height
      this._previewCtx.drawImage(image, 0, 0)
    } else {
      this.preview.width = this.output.width = 0
      this.preview.height = this.output.height = 0
    }
  }

  update (...args) {
    this._transformFn(this.output, this._outputCtx, ...args, this)
    return this
  }
}

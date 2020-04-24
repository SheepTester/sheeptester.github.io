export class AcceptImage {
  constructor (onImage) {
    this._onImages = []
    if (onImage) {
      if (typeof onImage !== 'function') {
        throw new TypeError('`onImage` is not a function.')
      }
      this._onImages.push(onImage)
    }

    this._listening = false
    this.image = null
  }

  onImage (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Given value is not a function.')
    }
    this._onImages.push(fn)
    return this
  }

  _callOnImages (...values) {
    for (const onImage of this._onImages) {
      onImage(...values)
    }
  }

  _loadImage (file) {
    if (file.type === 'image/svg+xml') {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.addEventListener('load', e => {
          resolve(img)
        }, { once: true })
        img.addEventListener('error', reject)
        img.src = URL.createObjectURL(file)
      })
    } else {
      return createImageBitmap(file)
    }
  }

  async _acceptImage (file) {
    this.image = file ? await this._loadImage(file) : null
    this._callOnImages(this.image)
  }

  listen () {
    if (this._listening) return
    document.addEventListener('paste', e => {
      this._acceptImage(e.clipboardData.files[0])
    })
    this._listening = true
    return this
  }

  addFileInputTo (elem, labelText = '') {
    const label = document.createElement('label')
    label.className = 'file-input-label'
    label.textContent = labelText
    const input = document.createElement('input')
    input.className = 'file-input'
    input.type = 'file'
    input.accept = 'image/*'
    input.addEventListener('change', e => {
      this._acceptImage(input.files[0])
    })
    label.appendChild(input)
    elem.appendChild(label)
    return this
  }
}

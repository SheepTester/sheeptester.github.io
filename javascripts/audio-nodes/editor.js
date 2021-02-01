import { Node, audioNodeParams } from './node.js'
import { audioCtx } from './audio-context.js'

export class Editor {
  #palette
  #container
  #dragArea
  #dragging = 0

  constructor (palette, container) {
    this.#palette = palette
    this.#container = container

    const dragArea = document.createElement('div')
    dragArea.className = 'drag-area'
    document.body.append(dragArea)
    this.#dragArea = dragArea

    palette.append(...this.#initPalette())
  }

  #addNode (AudioNodeConstructor) {
    const node = new Node(
      this,
      new AudioNodeConstructor(audioCtx),
      {
        params: audioNodeParams.get(AudioNodeConstructor)
      }
    )
    this.#container.append(node.element)
    return node
  }

  #initPalette () {
    const elements = []
    for (const audioNodeType of audioNodeParams.keys()) {
      const item = document.createElement('div')
      item.className = 'palette-item'
      item.textContent = audioNodeType.name
      item.addEventListener('pointerdown', e => {
        this.#addNode(audioNodeType).startDragging(e)
      })
      elements.push(item)
    }
    return elements
  }

  dragStart () {
    if (this.#dragging === 0) {
      this.#dragArea.classList.add('dragging')
    }
    this.#dragging++
    return {
      wrapper: this.#dragArea,
      stop: this.#dragEnd
    }
  }

  #dragEnd = () => {
    this.#dragging--
    if (this.#dragging === 0) {
      this.#dragArea.classList.remove('dragging')
    }
  }

  get container () {
    return this.#container
  }
}

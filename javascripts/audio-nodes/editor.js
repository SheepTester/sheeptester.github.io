import { Node, audioNodeParams, audioNodeOptions } from './node.js'
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

  #addNode (audioNode) {
    const node = new Node(
      this,
      audioNode,
      {
        options: audioNodeOptions.get(audioNode.constructor),
        params: audioNodeParams.get(audioNode.constructor)
      }
    )
    this.#container.append(node.element)
    return node
  }

  removeNode (editorNode) {
    editorNode.destroy()
  }

  #initPalette () {
    const elements = []
    for (const AudioNodeType of audioNodeParams.keys()) {
      const item = document.createElement('div')
      item.className = 'palette-item mono'
      item.textContent = AudioNodeType.name
      item.addEventListener('pointerdown', e => {
        this.#addNode(new AudioNodeType(audioCtx)).startDragging(e)
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

  get palette () {
    return this.#palette
  }

  get container () {
    return this.#container
  }
}

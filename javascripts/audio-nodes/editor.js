import { Node, audioNodeParams, audioNodeOptions } from './node.js'
import { audioCtx } from './audio-context.js'
import { SVG_NS } from './utils.js'

export class Editor {
  static SWOOPINESS = 100

  #palette
  #container
  #dragArea
  #dragging = 0
  #connectionsPath

  constructor (palette, container) {
    this.#palette = palette
    this.#container = container

    const dragArea = document.createElement('div')
    dragArea.className = 'drag-area'
    document.body.append(dragArea)
    this.#dragArea = dragArea

    const path = document.createElementNS(SVG_NS, 'path')
    this.#connectionsPath = path
    // this.#setPath([[{ x: 100, y: 100 }, { x: 200, y: 300 }]])

    const connections = document.createElementNS(SVG_NS, 'svg')
    connections.className.baseVal = 'connections'
    connections.append(path)
    container.append(connections)

    palette.append(...this.#initPalette())
  }

  #setPath (connections) {
    this.#connectionsPath.setAttributeNS(
      null,
      'd',
      connections
        .map(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) => (
          `M${x1} ${y1}C${x1 + Editor.SWOOPINESS} ${y1},${x2 - Editor.SWOOPINESS} ${y2},${x2} ${y2}`
        ))
        .join('')
    )
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

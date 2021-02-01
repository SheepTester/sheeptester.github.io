import { Node, audioNodeParams, audioNodeOptions } from './node.js'
import { SVG_NS } from './utils.js'

/**
 * @typedef Connection
 * @type {[import('../Vector2.js').Vector2, import('../Vector2.js').Vector2]}
 */

/**
 * @callback dragStopCallback
 */

/**
 * @typedef DragHandle
 * @property {HTMLDivElement} dragArea
 * @property {dragStopCallback} stop
 */

/**
 */
export class Editor {
  /**
   * The displacement on the x-axis for the control points of the connections,
   * hence "swoopiness."
   * @type {number}
   * @const
   */
  static SWOOPINESS = 100

  /**
   * @param {Connection} connection
   * @return {string}
   */
  static #getPath ([{ x: x1, y: y1 }, { x: x2, y: y2 }]) {
    return `M${x1} ${y1}C${x1 + Editor.SWOOPINESS} ${y1},${x2 - Editor.SWOOPINESS} ${y2},${x2} ${y2}`
  }

  /**
   * @type {HTMLElement}
   */
  #palette

  /**
   * @type {HTMLElement}
   */
  #container

  /**
   * @type {HTMLDivElement}
   */
  #dragArea

  /**
   * @type {number}
   */
  #dragging = 0

  /**
   * @type {SVGPathElement}
   */
  #connectionsPath

  /**
   * @type {SVGPathElement}
   */
  #activeConnectionPath

  /**
   * @param {HTMLElement} palette
   * @param {HTMLElement} container
   */
  constructor (palette, container) {
    this.#palette = palette
    this.#container = container

    const dragArea = document.createElement('div')
    dragArea.className = 'drag-area'
    document.body.append(dragArea)
    this.#dragArea = dragArea

    this.#connectionsPath = document.createElementNS(SVG_NS, 'path')
    this.#connectionsPath.className.baseVal = 'connections'
    this.#activeConnectionPath = document.createElementNS(SVG_NS, 'path')
    this.#activeConnectionPath.className.baseVal = 'active-connection'
    // this.#setPath([[{ x: 100, y: 100 }, { x: 200, y: 300 }]])

    const connections = document.createElementNS(SVG_NS, 'svg')
    connections.className.baseVal = 'connections-wrapper'
    connections.append(this.#connectionsPath, this.#activeConnectionPath)
    container.append(connections)

    palette.append(...this.#initPalette())
  }

  /**
   * @param {Connection[]} connections
   */
  #setPath (connections) {
    this.#connectionsPath.setAttributeNS(
      null,
      'd',
      connections.map(Editor.#getPath).join('')
    )
  }

  /**
   * @param {typeof AudioNode} connections
   */
  #addNode (AudioNodeType) {
    const node = new Node(
      this,
      AudioNodeType,
      {
        options: audioNodeOptions.get(AudioNodeType),
        params: audioNodeParams.get(AudioNodeType)
      }
    )
    this.#container.append(node.element)
    return node
  }

  /**
   * @param {import('./node.js').Node} editorNode
   */
  removeNode (editorNode) {
    editorNode.destroy()
  }

  /**
   * @return {HTMLDivElement[]}
   */
  #initPalette () {
    const elements = []
    for (const AudioNodeType of audioNodeParams.keys()) {
      const item = document.createElement('div')
      item.className = 'palette-item mono'
      item.textContent = AudioNodeType.name
      item.addEventListener('pointerdown', e => {
        this.#addNode(AudioNodeType).startDragging(e)
      })
      elements.push(item)
    }
    return elements
  }

  /**
   * @return {DragHandle}
   */
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

  /**
   */
  #dragEnd = () => {
    this.#dragging--
    if (this.#dragging === 0) {
      this.#dragArea.classList.remove('dragging')
    }
  }

  /**
   * @type {HTMLElement}
   */
  get palette () {
    return this.#palette
  }

  /**
   * @type {HTMLElement}
   */
  get container () {
    return this.#container
  }
}

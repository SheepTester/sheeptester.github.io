import { Vector2 } from '../Vector2.js'

export class Node {
  pos = new Vector2(0, 0)
  #audioNode
  #element
  #params = {}
  #inputs = []
  #outputs = []
  #dragging = null

  constructor (audioNode, {
    name = audioNode.constructor.name,
    params = [],
    inputs = audioNode.numberOfInputs,
    outputs = audioNode.numberOfOutputs
  } = {}) {
    this.#audioNode = audioNode

    const { element, paramInputs, inputPoints, outputPoints } = this.#createElement(name, params, inputs, outputs)
    this.#element = element
    this.#params = paramInputs
    this.#inputs = inputPoints
    this.#outputs = outputPoints
  }

  #createElement (name, params, inputs, outputs) {
    const paramInputs = {}
    const inputPoints = []
    const outputPoints = []

    const nameSpan = document.createElement('h2')
    nameSpan.className = 'node-name'
    nameSpan.textContent = name

    const inputConnections = document.createElement('div')
    inputConnections.className = 'node-connections node-inputs'

    const outputConnections = document.createElement('div')
    outputConnections.className = 'node-connections node-outputs'

    const element = document.createElement('div')
    element.className = 'node mono'
    element.append(nameSpan, inputConnections, outputConnections)

    for (const param of params) {
      const paramInput = document.createElement('input')
      paramInput.className = 'node-param-value'
      paramInput.value = this.#audioNode[param].value

      const paramLabel = document.createElement('label')
      paramLabel.className = 'node-param-label'
      paramLabel.append(param, paramInput)

      const paramWrapper = document.createElement('p')
      paramWrapper.className = 'node-param-wrapper'
      paramWrapper.append(paramLabel)

      element.append(paramWrapper)
      paramInputs[param] = paramInput
    }

    for (let i = 0; i < inputs; i++) {
      const connection = document.createElement('div')
      connection.className = 'node-connection-point'
      inputConnections.append(connection)
      inputPoints.push(connection)
    }

    for (let i = 0; i < outputs; i++) {
      const connection = document.createElement('div')
      connection.className = 'node-connection-point'
      outputConnections.append(connection)
      outputPoints.push(connection)
    }

    element.addEventListener('pointerdown', this.#onPointerDown)
    element.addEventListener('pointermove', this.#onPointerMove)
    element.addEventListener('pointerup', this.#onPointerUp)
    element.addEventListener('pointercancel', this.#onPointerUp)

    return {
      element,
      paramInputs,
      inputPoints,
      outputPoints
    }
  }

  #onPointerDown = e => {
    if (!this.#dragging) {
      const rect = this.#element.getBoundingClientRect()
      this.#dragging = {
        pointerId: e.pointerId,
        offset: Vector2.fromMouseEvent(e).sub(Vector2.fromRectPos(rect))
      }
      this.#element.setPointerCapture(e.pointerId)
    }
  }

  #onPointerMove = e => {
    if (this.#dragging && this.#dragging.pointerId === e.pointerId) {
      this.pos.set(Vector2.fromMouseEvent(e).sub(this.#dragging.offset))
      this.updatePos()
    }
  }

  #onPointerUp = e => {
    if (this.#dragging && this.#dragging.pointerId === e.pointerId) {
      this.#dragging = null
    }
  }

  updatePos () {
    const { x, y } = this.pos
    this.#element.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  get element () {
    return this.#element
  }
}

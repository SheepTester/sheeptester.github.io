import { Vector2 } from '../Vector2.js'
import { Rectangle } from '../Rectangle.js'

import { audioCtx } from './audio-context.js'

/**
 * @type {Map.<typeof AudioNode, Map.<string, [string | string[], *]>>}
 */
export const audioNodeOptions = new Map([
  [
    DelayNode,
    [
      ['maxDelayTime', ['float', 1]]
    ]
  ],
  [
    IIRFilterNode,
    [
      ['feedforward', ['floatlist', [0.00020298, 0.0004059599, 0.00020298]]],
      ['feedback', ['floatlist', [1.0126964558, -1.9991880801, 0.9873035442]]]
    ]
  ],
  [
    ChannelSplitterNode,
    [
      ['numberOfOutputs', ['int', 6]]
    ]
  ],
  [
    ChannelMergerNode,
    [
      ['numberOfInputs', ['int', 6]]
    ]
  ]
].map(([key, value]) => [key, new Map(value)]))

/**
 * @type {Map.<typeof AudioNode, Map.<string, string | string[]>>}
 */
export const audioNodeParams = new Map([
  [
    OscillatorNode,
    [
      ['frequency', 'param'],
      ['detune', 'param'],
      // TODO: setPeriodicWave?
      ['type', ['sine', 'square', 'sawtooth', 'triangle']],
      ['periodicWave', 'periodicwave'] // TODO
    ]
  ],
  [
    AudioBufferSourceNode,
    [
      ['buffer', 'buffer'], // TODO
      ['detune', 'param'],
      ['loop', 'boolean'],
      ['loopStart', 'float'],
      ['loopEnd', 'float'],
      ['playbackRate', 'param']
    ]
  ],
  // MediaElementAudioSourceNode, MediaStreamAudioSourceNode, MediaStreamTrackAudioSourceNode
  [
    BiquadFilterNode,
    [
      ['frequency', 'param'],
      ['detune', 'param'],
      ['Q', 'param'],
      ['gain', 'param'],
      ['type', ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']]
    ]
  ],
  [
    ConvolverNode,
    [
      ['buffer', 'buffer'],
      ['normalize', 'boolean']
    ]
  ],
  [
    DelayNode,
    [
      ['delayTime', 'param']
    ]
  ],
  [
    DynamicsCompressorNode,
    [
      ['threshold', 'param'],
      ['knee', 'param'],
      ['ratio', 'param'],
      ['reduction', 'float'],
      ['attack', 'param'],
      ['release', 'param']
    ]
  ],
  [
    GainNode,
    [
      ['gain', 'param']
    ]
  ],
  [
    WaveShaperNode,
    [
      ['curve', 'floatarray'], // TODO
      ['oversample', ['none', '2x', '4x']]
    ]
  ],
  [IIRFilterNode, []],
  // MediaStreamAudioDestinationNode, AnalyserNode
  [ChannelSplitterNode, []],
  [ChannelMergerNode, []],
  // PannerNode
  [
    StereoPannerNode,
    [
      ['pan', 'param']
    ]
  ]
].map(([key, value]) => [key, new Map(value)]))

/**
 * @typedef {object} Dragging
 * @property {import('../Vector2.js').Vector2} offset
 * @property {import('../Vector2.js').Vector2} containerOffset
 * @property {import('./editor.js').dragStopCallback} stop
 */

/**
 * @typedef {object} MouseDown
 * @property {number} pointerId
 * @property {import('../Vector2.js').Vector2} start
 * @property {?Dragging} dragging
 */

/**
 * @typedef {object} ConnectionPoint
 * @property {HTMLDivElement} element
 * @property {Vector2} offset
 */

/**
 */
export class Node {
  /**
   * Minimum mouse displacement to start dragging.
   * @type {number}
   * @const
   */
  static MIN_DRAG = 10

  /**
   * @type {import('../Vector2.js').Vector2}
   */
  pos = new Vector2(0, 0)

  /**
   * @type {import('./editor.js').Editor}
   */
  #editor

  /**
   * @type {typeof AudioNode}
   */
  #AudioNodeType

  /**
   * @type {AudioNode}
   */
  #audioNode

  /**
   * @type {Object.<string, *>}
   */
  #options = {}

  /**
   * @type {string[]}
   */
  #paramNames = {}

  /**
   * @type {HTMLDivElement}
   */
  #element

  /**
   * @type {HTMLDivElement}
   */
  #inputConnections

  /**
   * @type {HTMLDivElement}
   */
  #outputConnections

  /**
   * @type {ConnectionPoint[]}
   */
  #inputs

  /**
   * @type {ConnectionPoint[]}
   */
  #outputs

  /**
   * @type {?MouseDown}
   */
  #mouseDown = null

  /**
   * @param {import('./editor.js').Editor} editor
   * @param {typeof AudioNode} AudioNodeType
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {Map.<string, [string | string[], *]>} [options.options]
   * @param {Map.<string, string | string[]>} [options.params]
   */
  constructor (editor, AudioNodeType, {
    name = AudioNodeType.name,
    options = new Map(),
    params = new Map()
  } = {}) {
    this.#editor = editor
    this.#AudioNodeType = AudioNodeType
    this.#options = Object.fromEntries(
      Array.from(options, ([key, [, value]]) => [key, value])
    )
    this.#audioNode = this.#newAudioNode()
    this.#paramNames = [...params.keys()]

    const {
      element,
      inputConnections,
      outputConnections
    } = this.#createElement(name, options, params)
    this.#element = element
    this.#inputConnections = inputConnections
    this.#outputConnections = outputConnections
    this.#updateConnectionCount()
  }

  /**
   * @return {AudioNode}
   */
  #newAudioNode () {
    return new this.#AudioNodeType(audioCtx, this.#options)
  }

  /**
   * @param {string} name
   * @param {Map.<string, [string | string[], *]>} options
   * @param {Map.<string, string | string[]>} params
   * @return {HTMLDivElement}
   */
  #createElement (name, options, params) {
    const paramInputs = {}

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

    for (const [optionName, [type, defaultVal]] of options) {
      const { wrapper } = this.#createParam(optionName, type, true)
      element.append(wrapper)
    }
    for (const [paramName, type] of params) {
      const { wrapper } = this.#createParam(paramName, type, false)
      element.append(wrapper)
    }

    element.addEventListener('pointerdown', this.#onPointerDown)
    element.addEventListener('pointermove', this.#onPointerMove)
    element.addEventListener('pointerup', this.#onPointerUp)
    element.addEventListener('pointercancel', this.#onPointerUp)

    return {
      element,
      inputConnections,
      outputConnections
    }
  }

  /**
   * @param {HTMLElement} parent
   * @return {Node} - this
   */
  addTo (parent) {
    parent.append(this.#element)
    this.#measureConnectionPoints()
    return this
  }

  /**
   * @return {HTMLDivElement}
   */
  #createConnectionPoint () {
    const connection = document.createElement('div')
    connection.className = 'node-connection-point'
    return connection
  }

  /**
   */
  #measureConnectionPoints () {
    const elemPos = Rectangle.clientBounds(this.#element).pos
    this.#inputs = Array.from(
      this.#inputConnections.children,
      element => ({
        element,
        offset: Rectangle.clientBounds(element).centre.sub(elemPos)
      })
    )
    this.#outputs = Array.from(
      this.#outputConnections.children,
      element => ({
        element,
        offset: Rectangle.clientBounds(element).centre.sub(elemPos)
      })
    )
  }

  /**
   * Called whenever the number of inputs/outputs may have changed.
   */
  #updateConnectionCount () {
    const inputs = this.#audioNode.numberOfInputs
    const outputs = this.#audioNode.numberOfOutputs
    this.#element.style.minHeight = Math.max(inputs, outputs) * 20 + 'px'

    for (let i = this.#inputConnections.children.length; i < inputs; i++) {
      this.#inputConnections.append(this.#createConnectionPoint())
    }
    while (this.#inputConnections.children.length > inputs) {
      this.#inputConnections.lastElementChild.remove()
    }

    for (let i = this.#outputConnections.children.length; i < outputs; i++) {
      this.#outputConnections.append(this.#createConnectionPoint())
    }
    while (this.#outputConnections.children.length > outputs) {
      this.#outputConnections.lastElementChild.remove()
    }

    this.#measureConnectionPoints()
  }

  /**
   * Called whenever the AudioNode options may have changed; reconstructs
   * `this.#audioNode`.
   */
  #updateOptions () {
    try {
      const oldAudioNode = this.#audioNode
      this.#audioNode = this.#newAudioNode()
      for (const paramName of this.#paramNames) {
        if (this.#audioNode[paramName] instanceof AudioParam) {
          this.#audioNode[paramName].value = this.#audioNode[paramName].value
        } else {
          this.#audioNode[paramName] = this.#audioNode[paramName]
        }
      }
      this.#updateConnectionCount()
      this.#element.classList.remove('node-error')
      this.#element.title = ''
    } catch (err) {
      this.#element.classList.add('node-error')
      this.#element.title = err.toString()
    }
  }

  /**
   * @param {string} name
   * @param {string | string[]} type
   * @param {boolean} isOption
   * @return {HTMLParagraphElement}
   */
  #createParam = (name, type, isOption = false) => {
    const valueSrc = isOption ? this.#options : this.#audioNode
    let input
    let read = () => {}
    let write = () => {}
    if (Array.isArray(type)) {
      input = document.createElement('select')
      for (const value of type) {
        const option = document.createElement('option')
        option.value = value
        option.textContent = value
        input.append(option)
      }
      read = () => {
        input.value = valueSrc[name]
      }
      write = () => {
        valueSrc[name] = input.value
      }
      input.addEventListener('change', write)
    } else if (type === 'param' || type === 'float' || type === 'int') {
      input = document.createElement('input')
      input.type = 'number'
      input.step = 'any'
      if (type === 'param') {
        input.min = valueSrc[name].minValue
        input.max = valueSrc[name].maxValue
        read = () => {
          input.value = valueSrc[name].value
        }
        write = () => {
          valueSrc[name].value = +input.value
          if (isOption) this.#updateOptions()
        }
      } else if (type === 'float') {
        read = () => {
          input.value = valueSrc[name]
        }
        write = () => {
          valueSrc[name] = +input.value
          if (isOption) this.#updateOptions()
        }
      } else {
        input.step = 1
        read = () => {
          input.value = valueSrc[name]
        }
        write = () => {
          valueSrc[name] = parseInt(input.value)
          if (isOption) this.#updateOptions()
        }
      }
      input.addEventListener('change', write)
    } else if (type === 'boolean') {
      input = document.createElement('input')
      input.type = 'checkbox'
      read = () => {
        input.checked = valueSrc[name]
      }
      write = () => {
        valueSrc[name] = input.checked
        if (isOption) this.#updateOptions()
      }
      input.addEventListener('change', write)
    } else {
      input = document.createElement('div')
      console.warn('Unknown param type', type)
    }
    input.className = `node-param-value node-param-value-${type}`
    read()

    const label = document.createElement('label')
    label.className = 'node-param-label'
    label.append(name, input)

    const wrapper = document.createElement('p')
    wrapper.className = 'node-param-wrapper'
    wrapper.append(label)

    return {
      read,
      write,
      wrapper
    }
  }

  /**
   * @param {PointerEvent} e
   */
  #onPointerDown = e => {
    const clickTarget = e.target.closest('.node-param-value, .node-connection-point, .node')
    if (!clickTarget || clickTarget.classList.contains('node-param-value')) {
      return
    } else if (clickTarget.classList.contains('node-connection-point')) {
      const handle = this.#editor.startConnecting(e)
      if (handle) {
        clickTarget.classList.add('node-connection-point-connecting')
      }
      return
    }

    if (!this.#mouseDown) {
      const mouse = Vector2.fromMouseEvent(e)

      this.#mouseDown = {
        pointerId: e.pointerId,
        start: mouse.clone(),
        dragging: null
      }
      this.#element.setPointerCapture(e.pointerId)
      e.stopPropagation()
    }
  }

  /**
   * @param {PointerEvent} e
   */
  #startDrag = e => {
    const rect = Rectangle.clientBounds(this.#element)
    const containerRect = Rectangle.clientBounds(this.#editor.container)
    const offset = this.#mouseDown.start.clone().sub(rect.pos)

    const { wrapper, stop } = this.#editor.dragStart()
    wrapper.append(this.#element)
    // Reset pointer capture because it gets lost when parents change
    this.#element.setPointerCapture(e.pointerId)

    this.#mouseDown.dragging = {
      offset,
      containerOffset: containerRect.pos,
      stop
    }
  }

  /**
   * @param {PointerEvent} e
   */
  #onPointerMove = e => {
    if (this.#mouseDown && this.#mouseDown.pointerId === e.pointerId) {
      const mouse = Vector2.fromMouseEvent(e)
      if (!this.#mouseDown.dragging && mouse.clone().sub(this.#mouseDown.start).lengthSquared > Node.MIN_DRAG ** 2) {
        this.#startDrag(e)
      }
      if (this.#mouseDown.dragging) {
        const base = mouse.clone()
          .sub(this.#mouseDown.dragging.offset)
        if (e.shiftKey) {
          base
            .sub(this.#mouseDown.dragging.containerOffset)
            .map(n => Math.round(n / 10) * 10)
            .add(this.#mouseDown.dragging.containerOffset)
        }
        this.pos.set(base)
        this.updatePos()
      }
    }
  }

  /**
   * @param {PointerEvent} e
   */
  #onPointerUp = e => {
    if (this.#mouseDown && this.#mouseDown.pointerId === e.pointerId) {
      const mouse = Vector2.fromMouseEvent(e)
      if (this.#mouseDown.dragging) {
        const paletteRect = Rectangle.clientBounds(this.#editor.palette)
        if (paletteRect.contains(mouse)) {
          this.#editor.removeNode(this)
        } else {
          const containerRect = Rectangle.clientBounds(this.#editor.container)
          this.pos.sub(containerRect.pos)
          this.updatePos()
          this.#mouseDown.dragging.stop()
          this.#editor.container.append(this.#element)
        }
      }
      this.#mouseDown = null
    }
  }

  /**
   * @param {PointerEvent} e
   */
  startDragging (e) {
    const mouse = Vector2.fromMouseEvent(e)
    this.#mouseDown = {
      pointerId: e.pointerId,
      start: mouse,
      dragging: null
    }
    this.#startDrag(e)
    this.#mouseDown.dragging.offset.set(new Vector2(10, 10))
    this.#onPointerMove(e)
  }

  /**
   */
  updatePos () {
    const { x, y } = this.pos
    this.#element.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  /**
   */
  destroy () {
    this.#element.remove()
  }
}

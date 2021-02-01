import { Vector2 } from '../Vector2.js'

export const audioNodeOptions = new Map([
  [
    DelayNode,
    [
      ['maxDelayTime', 'float']
    ]
  ],
  [
    IIRFilterNode,
    [
      ['feedforward', 'floatlist'],
      ['feedback', 'floatlist']
    ]
  ],
  [
    ChannelSplitterNode,
    [
      ['numberOfOutputs', 'int']
    ]
  ],
  [
    ChannelMergerNode,
    [
      ['numberOfInputs', 'int']
    ]
  ]
])

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
      ['reduction', 'param'],
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

export class Node {
  static MIN_DRAG = 10

  pos = new Vector2(0, 0)
  #editor
  #audioNode
  #element
  #inputs = []
  #outputs = []
  #mouseDown = null

  constructor (editor, audioNode, {
    name = audioNode.constructor.name,
    options = [],
    params = [],
    inputs = audioNode.numberOfInputs,
    outputs = audioNode.numberOfOutputs
  } = {}) {
    this.#editor = editor
    this.#audioNode = audioNode

    const { element, inputPoints, outputPoints } = this.#createElement(name, options, params, inputs, outputs)
    this.#element = element
    this.#inputs = inputPoints
    this.#outputs = outputPoints
  }

  #createElement (name, options, params, inputs, outputs) {
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

    for (const [optionName, type] of options) {
      const { wrapper } = this.#createParam(optionName, type, true)
      element.append(wrapper)
    }
    for (const [paramName, type] of params) {
      const { wrapper } = this.#createParam(paramName, type, false)
      element.append(wrapper)
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
      inputPoints,
      outputPoints
    }
  }

  #createParam = (name, type, isOption = false) => {
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
        input.value = this.#audioNode[name]
      }
      write = () => {
        this.#audioNode[name] = input.value
      }
      input.addEventListener('change', write)
    } else if (type === 'param' || type === 'float') {
      input = document.createElement('input')
      if (type === 'param') {
        read = () => {
          input.value = this.#audioNode[name].value
        }
        write = () => {
          this.#audioNode[name].setValueAtTime(audioCtx.currentTime, +input.value)
        }
      } else {
        read = () => {
          input.value = this.#audioNode[name]
        }
        write = () => {
          this.#audioNode[name] = +input.value
        }
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

  #onPointerDown = e => {
    if (e.target.closest('.node-param-value, .node-connection-point')) {
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

  #startDrag = e => {
    const rect = this.#element.getBoundingClientRect()
    const offset = this.#mouseDown.start.clone().sub(Vector2.fromRectPos(rect))

    const { wrapper, stop } = this.#editor.dragStart()
    wrapper.append(this.#element)
    // Reset pointer capture because it gets lost when parents change
    this.#element.setPointerCapture(e.pointerId)

    this.#mouseDown.dragging = {
      offset,
      stop
    }
  }

  #onPointerMove = e => {
    if (this.#mouseDown && this.#mouseDown.pointerId === e.pointerId) {
      const mouse = Vector2.fromMouseEvent(e)
      if (!this.#mouseDown.dragging && mouse.clone().sub(this.#mouseDown.start).lengthSquared > Node.MIN_DRAG ** 2) {
        this.#startDrag(e)
      }
      if (this.#mouseDown.dragging) {
        this.pos.set(mouse.clone().sub(this.#mouseDown.dragging.offset))
        this.updatePos()
      }
    }
  }

  #onPointerUp = e => {
    if (this.#mouseDown && this.#mouseDown.pointerId === e.pointerId) {
      if (this.#mouseDown.dragging) {
        const containerRect = this.#editor.container.getBoundingClientRect()
        this.pos.sub(Vector2.fromRectPos(containerRect))
        this.updatePos()
        this.#mouseDown.dragging.stop()
        this.#editor.container.append(this.element)
      }
      this.#mouseDown = null
    }
  }

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

  updatePos () {
    const { x, y } = this.pos
    this.#element.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  get element () {
    return this.#element
  }
}

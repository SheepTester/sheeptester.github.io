import { Vector2 } from '../Vector2.js'
import { Rectangle } from '../Rectangle.js'

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

    const {
      element,
      inputConnections,
      outputConnections,
      inputPoints,
      outputPoints
    } = this.#createElement(name, options, params, inputs, outputs)
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
    element.style.minHeight = Math.max(inputs, outputs) * 20 + 'px'
    element.append(nameSpan, inputConnections, outputConnections)

    for (const [optionName, [type, defaultVal]] of options) {
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
      inputConnections,
      outputConnections,
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
    } else if (type === 'param' || type === 'float' || type === 'int') {
      input = document.createElement('input')
      input.type = 'number'
      input.step = 'any'
      if (type === 'param') {
        input.min = this.#audioNode[name].minValue
        input.max = this.#audioNode[name].maxValue
        read = () => {
          input.value = this.#audioNode[name].value
        }
        write = () => {
          this.#audioNode[name].setValueAtTime(audioCtx.currentTime, +input.value)
        }
      } else if (type === 'float') {
        read = () => {
          input.value = this.#audioNode[name]
        }
        write = () => {
          this.#audioNode[name] = +input.value
        }
      } else {
        input.step = 1
        read = () => {
          input.value = this.#audioNode[name]
        }
        write = () => {
          this.#audioNode[name] = parseInt(input.value)
        }
      }
      input.addEventListener('change', write)
    } else if (type === 'boolean') {
      input = document.createElement('input')
      input.type = 'checkbox'
      read = () => {
        input.checked = this.#audioNode[name]
      }
      write = () => {
        this.#audioNode[name] = input.checked
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
          this.#editor.container.append(this.element)
        }
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

  destroy () {
    this.#element.remove()
  }

  get element () {
    return this.#element
  }
}

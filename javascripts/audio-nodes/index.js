import { Vector2 } from '../Vector2.js'

import { Node } from './node.js'
import { audioCtx } from './audio-context.js'
export { audioCtx }

const nodeArea = document.getElementById('node-area')
export const node = new Node(new OscillatorNode(audioCtx), {
  params: ['detune', 'frequency'],
  inputs: 3
})
node.pos.add(new Vector2(10, 10))
node.updatePos()
nodeArea.append(node.element)

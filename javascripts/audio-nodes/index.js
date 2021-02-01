import { Vector2 } from '../Vector2.js'

import { Editor } from './editor.js'
export { audioCtx } from './audio-context.js'

export const editor = new Editor(
  document.getElementById('palette'),
  document.getElementById('node-area')
)

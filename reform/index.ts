import './reform.css'
import { FileInput, Input } from './src/inputs'

const inputs: Record<string, Input<any>> = {}

for (const input of document.getElementsByClassName('reform:image-input')) {
  if (!(input instanceof HTMLInputElement)) {
    console.warn(input, 'is not an <input> element')
    continue
  }
  const dropTarget = input.closest('.two-col-io')
  const canvas = dropTarget?.querySelector('.input-content canvas')
  if (!(canvas instanceof HTMLCanvasElement)) {
    console.warn(canvas, 'is not a <canvas> element')
    continue
  }
  const context = canvas.getContext('2d')
  inputs[input.name] = new FileInput({
    fileName: input.parentElement?.querySelector('.file-name') ?? undefined,
    input,
    dropTarget: dropTarget instanceof HTMLElement ? dropTarget : undefined,
    pasteTarget: input.classList.contains('reform:paste-target'),
    onFile: async file => {
      const url = URL.createObjectURL(file)
      try {
        const image = document.createElement('img')
        image.src = url
        await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve)
          image.addEventListener('error', reject)
        })
        canvas.width = image.width
        canvas.height = image.height
        context?.drawImage(image, 0, 0)
        return canvas
      } finally {
        URL.revokeObjectURL(url)
      }
    }
  })
  inputs[input.name].dependents.push(console.log)
}

import './reform.css'
import { FileInput } from './src/inputs'

for (const input of document.getElementsByClassName('reform:image-input')) {
  FileInput.fromImageInput(input).dependents.push(console.log)
}

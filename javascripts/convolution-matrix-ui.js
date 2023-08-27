import { Fragment, h, render } from 'https://esm.sh/preact@10.17.1'
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'https://esm.sh/preact@10.17.1/hooks'
import { Program, generateFragmentShader } from './convolution-matrix-webgl.js'

const RECT_VERTEX_COUNT = 6

function App () {
  const [radiusRaw, setRadiusRaw] = useState('2')
  const radius = +radiusRaw
  const width = 2 * radius + 1
  const [data, setData] = useState(() => {
    const initData = new Array(width ** 2).fill('0')
    initData[Math.floor(initData.length / 2)] = '1'
    return initData
  })
  const [normalize, setNormalize] = useState(true)
  const [image, setImage] = useState(null)
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  useEffect(() => {
    glRef.current = canvasRef.current.getContext('webgl2')
  }, [])
  const varsRef = useRef(null)
  useEffect(() => {
    const program = new Program(glRef.current, {
      vertex: `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;

        void main() {
          gl_Position = vec4(a_position, 0, 1);
          v_texCoord = a_texCoord;
        }
      `,
      fragment: generateFragmentShader(radius)
    })
    varsRef.current = {
      program,
      position: program
        .attribute('a_position')
        .bind()
        .data(new Float32Array([-1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, -1])),
      texCoord: program
        .attribute('a_texCoord')
        .bind()
        .data(new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1])),
      imageSize: program.uniform('u_imageSize'),
      kernel: program.uniform('u_kernel[0]')
    }
  }, [radius])

  function setRadius (radiusRaw) {
    setRadiusRaw(radiusRaw)
    const newWidth = 2 * +radiusRaw + 1
    setData(
      Array.from({ length: newWidth ** 2 }, (_, i) => {
        const row = Math.floor(i / newWidth) - +radiusRaw
        const col = (i % newWidth) - +radiusRaw
        if (Math.abs(row) <= radius && Math.abs(col) <= radius) {
          return data[(row + radius) * width + (col + radius)]
        } else {
          return '0'
        }
      })
    )
  }

  async function loadFile ([file]) {
    if (!file) {
      return
    }
    const url = URL.createObjectURL(file)
    const image = document.createElement('img')
    image.src = url
    await new Promise(resolve => image.addEventListener('load', resolve))
    URL.revokeObjectURL(url)
    setImage(image)
  }

  useEffect(() => {
    const handlePaste = e => {
      loadFile(e.clipboardData.files)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  useEffect(() => {
    fetch('./convolution-matrix-test-image.webp')
      .then(r => r.blob())
      .then(createImageBitmap)
      .then(setImage)
  }, [])

  useEffect(() => {
    if (!image) {
      return
    }
    const gl = glRef.current
    const { program, position, texCoord, imageSize, kernel } = varsRef.current

    gl.canvas.width = image.width
    gl.canvas.height = image.height
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    program.use()

    position.enable().bind().setPointer({ components: 2 })
    texCoord.enable().bind().setPointer({ components: 2 })
    gl.uniform2f(imageSize, image.width, image.height)
    const sum = data.reduce((cum, curr) => cum + +curr, 0)
    const scale = normalize && sum !== 0 ? sum : 1
    gl.uniform1fv(
      kernel,
      data.map(number => +number / scale)
    )

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    gl.drawArrays(gl.TRIANGLES, 0, RECT_VERTEX_COUNT)
  }, [normalize, image, data])

  return h(
    Fragment,
    null,
    h(
      'p',
      null,
      h(
        'label',
        null,
        'Paste or select an image: ',
        h('input', {
          type: 'file',
          accept: 'image/*',
          onInput: e => loadFile(e.currentTarget.files)
        })
      )
    ),
    h(
      'p',
      null,
      h(
        'label',
        null,
        'Size: ',
        h('input', {
          type: 'range',
          min: 0,
          max: 5,
          value: radius,
          onInput: e => setRadius(e.currentTarget.value)
        })
      ),
      h('input', {
        type: 'text',
        inputMode: 'numeric',
        pattern: '[0-9]*',
        value: radius,
        onInput: e => setRadius(e.currentTarget.value)
      })
    ),
    h(
      'fieldset',
      null,
      h('legend', null, 'Convolution matrix'),
      h(
        'table',
        null,
        Array.from({ length: width }, (_, row) =>
          h(
            'tr',
            { key: row },
            Array.from({ length: width }, (_, col) => {
              const index = row * width + col
              return h(
                'td',
                { key: col },
                h('input', {
                  type: 'text',
                  inputMode: 'numeric',
                  pattern: '-?[0-9]*[.][0-9]*',
                  value: data[index],
                  onInput: e =>
                    setData(
                      data.map((number, i) =>
                        i === index ? e.currentTarget.value : number
                      )
                    )
                })
              )
            })
          )
        )
      )
    ),
    h(
      'p',
      null,
      h(
        'label',
        null,
        h('input', {
          type: 'checkbox',
          checked: normalize,
          onInput: e => setNormalize(e.currentTarget.checked)
        }),
        ' Normalize? (Scales down the matrix so all cells add up to 1.)'
      )
    ),
    h('canvas', { ref: canvasRef })
  )
}

render(h(App), document.getElementById('root'))

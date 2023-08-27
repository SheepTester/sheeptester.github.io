// @ts-check

/**
 * Type alias for a WebGL canvas rendering context.
 * @typedef {WebGL2RenderingContext} Context
 */

/**
 * @typedef {object} ProgramShaders
 * @property {string} vertex - Vertex shader source.
 * @property {string} fragment - Fragment shader source.
 */

export class Program {
  /** @type {Context} */
  #gl
  /** @type {WebGLProgram} */
  #program

  /**
   * @param {Context} gl
   * @param {ProgramShaders} shaders
   */
  constructor (gl, { vertex, fragment }) {
    this.#gl = gl
    this.#program = this.#createProgram([
      this.#createShader(gl.VERTEX_SHADER, vertex),
      this.#createShader(gl.VERTEX_SHADER, fragment)
    ])
  }

  /**
   * @param {Context['VERTEX_SHADER'] | Context['FRAGMENT_SHADER']} type
   * @param {string} source
   * @returns {WebGLShader}
   */
  #createShader (type, source) {
    const shader = this.#gl.createShader(type)
    if (!shader) {
      throw new TypeError("WebGL couldn't create shader.")
    }
    this.#gl.shaderSource(shader, source)
    this.#gl.compileShader(shader)
    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      console.warn(this.#gl.getShaderInfoLog(shader))
      this.#gl.deleteShader(shader)
      throw new SyntaxError('Shader failed to compile')
    }
    return shader
  }

  /**
   * @param {WebGLShader[]} shaders
   * @returns {WebGLProgram}
   */
  #createProgram (shaders) {
    const program = this.#gl.createProgram()
    if (!program) {
      throw new TypeError("WebGL couldn't create program.")
    }
    for (const shader of shaders) {
      this.#gl.attachShader(program, shader)
    }
    this.#gl.linkProgram(program)
    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      console.log(this.#gl.getProgramInfoLog(program))
      this.#gl.deleteProgram(program)
      throw new SyntaxError('Program failed to link shader.')
    }
    return program
  }

  /**
   * @param {string} name - Name of attribute in shader source code.
   */
  attribute (name) {
    const buffer = this.#gl.createBuffer()
    if (!buffer) {
      throw new TypeError("WebGL couldn't create buffer.")
    }
    return new Attribute(
      this.#gl,
      this.#gl.getAttribLocation(this.#program, name),
      buffer
    )
  }

  use () {
    this.#gl.useProgram(this.#program)
  }
}

/**
 * @typedef {object} AttributePointerOptions
 * @property {number} components - Number of values per attribute value block.
 * @property {GLenum} [type] - Type of each values. Defaults to `gl.FLOAT`
 * (32-bit float).
 * @property {boolean} [normalize] - Whether to normalize integers to floats.
 * Doesn't do anything if `type` is `gl.FLOAT`. Defaults to false.
 * @property {number} [spacing] - Number of bytes between attribute value
 * blocks. Defaults to 0. (`stride`)
 * @property {number} [start] - Start index in buffer. Defaults to 0. (`offset`)
 */

/**
 * An attribute is a type of shader variable and is the input from the CPU (as
 * opposed to a previous shader) for an iteration of the shader. For example, a
 * vertex shader can be run on each vertex of a shape. Therefore, while a shader
 * handles one attribute value at a time, the CPU passes all the shader values
 * in a buffer.
 *
 * Because CPU–GPU communication is slow, ideally you should only set the buffer
 * data once during initialization, then change uniforms to rotate an object,
 * for example. You can also selectively render different segments of the
 * buffer.
 *
 * If you do need to change the data, you can just call `gl.bufferData` during
 * render after binding the buffer to `ARRAY_BUFFER`.
 */
class Attribute {
  /** @type {Context} */
  #gl
  /** @type {number} */
  #location
  /** @type {WebGLBuffer} */
  #buffer

  /**
   * @param {Context} gl
   * @param {number} location
   * @param {WebGLBuffer} buffer
   */
  constructor (gl, location, buffer) {
    this.#gl = gl
    this.#location = location
    this.#buffer = buffer
  }

  /**
   * @returns {this}
   */
  enable () {
    this.#gl.enableVertexAttribArray(this.#location)
    return this
  }

  /**
   *
   */
  bind () {
    // Select the bind point `ARRAY_BUFFER`
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer)
    return this
  }

  /**
   * @param {BufferSource} data
   * @returns {this}
   */
  data (data) {
    // `STATIC_DRAW` - Optimization hint meaning the data won't change often
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, data, this.#gl.STATIC_DRAW)
    return this
  }

  /**
   * @param {AttributePointerOptions} options
   * @returns {this}
   */
  setPointer ({
    components,
    type = this.#gl.FLOAT,
    normalize = false,
    spacing = 0,
    start = 0
  }) {
    // Implicitly binds the buffer bound to `ARRAY_BUFFER` directly to the
    // attribute, so `ARRAY_BUFFER` can be bound to something else.
    this.#gl.vertexAttribPointer(
      this.#location,
      components,
      type,
      normalize,
      spacing,
      start
    )
    return this
  }
}

/**
 * @param {Context} gl
 */
function test (gl) {
  // Init
  const program = new Program(gl, { vertex: '', fragment: '' })
  const position = program
    .attribute('a_position')
    .bind()
    .data(new Float32Array([10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30]))
  const resolution = gl.getUniformLocation(program, 'u_resolution')

  // Render
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program)

  position.enable().bind().setPointer({ components: 2 })
  gl.uniform2f(resolution, gl.canvas.width, gl.canvas.height)

  // Run vertex shader 6 times
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

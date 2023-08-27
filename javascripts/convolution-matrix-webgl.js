// @ts-check

/**
 * Type alias for a WebGL canvas rendering context.
 * @typedef {WebGL2RenderingContext} Context
 */

/**
 * @param {Context} gl
 * @param {Context['VERTEX_SHADER'] | Context['FRAGMENT_SHADER']} type
 * @param {string} source
 * @returns {WebGLShader}
 */
export function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) throw new TypeError("WebGL couldn't create shader.")
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw new SyntaxError('Shader failed to compile')
  }
  return shader
}

/**
 * @param {Context} gl
 * @param {WebGLShader[]} shaders
 * @returns {WebGLProgram}
 */
export function createProgram (gl, shaders) {
  const program = gl.createProgram()
  if (!program) throw new TypeError("WebGL couldn't create program.")
  for (const shader of shaders) {
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    throw new SyntaxError('Program failed to link shader.')
  }
  return program
}

/**
 * @typedef {object} Attribute
 * @property {number} location
 * @property {WebGLBuffer} buffer
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
 *
 * @param {Context} gl
 * @param {WebGLProgram} program
 * @param {string} attrName
 * @param {Float32Array} data
 * @returns {Attribute}
 */
export function initAttrData (gl, program, attrName, data) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new TypeError("WebGL couldn't create buffer.")
  // Select the bind point `ARRAY_BUFFER`
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  // `STATIC_DRAW` - Optimization hint meaning the data won't change often
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  return { location: gl.getAttribLocation(program, attrName), buffer }
}

/**
 * @param {Context} gl
 */
function test (gl) {
  // Init
  const program = createProgram(gl, [
    createShader(gl, gl.VERTEX_SHADER, ''),
    createShader(gl, gl.FRAGMENT_SHADER, '')
  ])
  const position = initAttrData(
    gl,
    program,
    'a_position',
    new Float32Array([10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30])
  )
  const resolution = gl.getUniformLocation(program, 'u_resolution')

  // Render
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program)

  gl.enableVertexAttribArray(position.location)
  // Select position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer)
  // Implicitly binds the buffer bound to `ARRAY_BUFFER` directly to the
  // attribute, so `ARRAY_BUFFER` can be bound to something else. Parameters:
  // - 2 components at a time; unspecified components of a vec4 default to 0, 0,
  //   0, 1
  // - buffer contains 32-bit floats
  // - disable normalization (meant for normalizing ints to float)
  // - 0 bytes of spacing between attribute value blocks
  // - start at index 0 of buffer
  gl.vertexAttribPointer(position.location, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(resolution, gl.canvas.width, gl.canvas.height)

  // Run vertex shader 6 times
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

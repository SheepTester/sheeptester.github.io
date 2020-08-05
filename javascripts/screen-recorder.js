let audioContext = null
function getAudioCtx () {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function delay (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

function once (eventTarget, eventName) {
  return new Promise(resolve =>
    eventTarget.addEventListener(eventName, resolve, { once: true }))
}

function stopStream (stream) {
  for (const track of stream.getTracks()) {
    track.stop()
  }
}

export async function start () {
  const video = document.createElement('video')
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true
  })
  video.srcObject = stream
  video.muted = true
  document.body.appendChild(video)
  video.play()
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm'
  })
  recorder.addEventListener('dataavailable', e => {
    const url = URL.createObjectURL(e.data)
    const video = document.createElement('video')
    video.controls = true
    video.src = url
    document.body.appendChild(video)
    video.play()
    const link = document.createElement('a')
    link.href = url
    link.download = 'eeee.webm'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // URL.revokeObjectURL(url)
  })
  recorder.start()
  await delay(3000)
  recorder.stop()
  stopStream(stream)
  video.srcObject = null
  document.body.removeChild(video)
}

export async function micTest () {
  // linear-gradient(90deg, red 60%, transparent 60%)
  const audioCtx = getAudioCtx()
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const source = audioCtx.createMediaStreamSource(stream)
  const analyser = audioCtx.createAnalyser()
  source.connect(analyser)
  analyser.fftSize = 2048
  // analyser.connect(audioCtx.destination)

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)
  function draw () {
    analyser.getFloatTimeDomainData(dataArray)
    const rms = Math.sqrt(dataArray.reduce((acc, curr) => acc + curr * curr, 0) / dataArray.length)
    document.body.style.backgroundImage = `linear-gradient(90deg, red ${Math.sqrt(rms / 0.55) * 100}%, transparent ${Math.sqrt(rms / 0.55) * 100}%)`
    window.requestAnimationFrame(draw)
  }
  draw()
}

export async function camTest () {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  const video = document.createElement('video')
  video.srcObject = stream
  video.play()
  // document.body.appendChild(video)
  await once(video, 'loadedmetadata')
  await video.requestPictureInPicture()
}

const elems = {
  videoWrapper: document.getElementById('video-wrapper'),
  video: document.getElementById('video'),
  recordScreen: document.getElementById('record-screen'),
  recordCamera: document.getElementById('record-cam'),
  controlBtns: document.getElementById('control-btns'),
  recordBtn: document.getElementById('record'),
  pause: document.getElementById('pause'),
  resume: document.getElementById('resume'),
  stopRecord: document.getElementById('stop-record'),
  stopStream: document.getElementById('disable-cam')
}
let stream
let recorder
function setStream (newStream) {
  stream = newStream
  document.body.classList.remove('no-video-source')
  elems.video.srcObject = stream
  elems.video.play()
  elems.recordBtn.disabled = false
}
elems.recordScreen.addEventListener('click', async e => {
  if (!stream) {
    setStream(await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true
    }))
  }
})
elems.recordCamera.addEventListener('click', async e => {
  if (!stream) {
    setStream(await navigator.mediaDevices.getUserMedia({
      video: true
    }))
  }
})
elems.recordBtn.addEventListener('click', e => {
  if (!recorder) {
    recorder = new MediaRecorder(stream, {
      // Possible list of supported MIME types
      // Chrome: https://stackoverflow.com/a/42307926
      // Firefox, maybe: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported#Example
      mimeType: 'video/webm'
    })
    recorder.addEventListener('dataavailable', e => {
      recorder = null
      const url = URL.createObjectURL(e.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `recording ${new Date().toLocaleString()}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
    recorder.start()
    document.body.classList.add('recording')
    document.body.classList.remove('paused')
    elems.stopRecord.disabled = false
  }
})
elems.pause.addEventListener('click', e => {
  if (recorder) {
    recorder.pause()
    document.body.classList.add('paused')
  }
})
elems.resume.addEventListener('click', e => {
  if (recorder) {
    recorder.resume()
    document.body.classList.remove('paused')
  }
})
elems.stopRecord.addEventListener('click', e => {
  if (recorder) {
    recorder.stop()
    document.body.classList.remove('recording')
    elems.stopRecord.disabled = true
  }
})
elems.stopStream.addEventListener('click', e => {
  if (stream) {
    if (recorder) {
      elems.stopRecord.click()
    }
    stopStream(stream)
    stream = null
    elems.video.srcObject = null
    elems.video.pause()
    document.body.classList.add('no-video-source')
    elems.recordBtn.disabled = true
  }
})

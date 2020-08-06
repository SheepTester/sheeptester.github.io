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

async function getSources () {
  const devices = {
    audio: [],
    video: []
  }
  for (const { kind, label, deviceId } of await navigator.mediaDevices.enumerateDevices()) {
    if (kind === 'audioinput') {
      devices.audio.push({ label, deviceId })
    } else if (kind === 'videoinput') {
      devices.video.push({ label, deviceId })
    }
  }
  return devices
}

function analyse (stream) {
  const audioCtx = getAudioCtx()
  let source
  try {
    source = audioCtx.createMediaStreamSource(stream)
  } catch (err) {
    // Failed to execute 'createMediaStreamSource' on 'AudioContext':
    // MediaStream has no audio track
    return null
  }
  const analyser = audioCtx.createAnalyser()
  source.connect(analyser)
  analyser.fftSize = 2048
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)
  return () => {
    analyser.getFloatTimeDomainData(dataArray)
    const rms = Math.sqrt(dataArray.reduce((acc, curr) => acc + curr * curr, 0) / dataArray.length)
    return Math.sqrt(rms / 0.55)
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
  stopRecord: document.getElementById('stop-record'),
  stopStream: document.getElementById('disable-cam'),
  toggleMic: document.getElementById('toggle-mic'),
  micVolume: document.getElementById('mic-volume'),
  screenVolume: document.getElementById('screen-volume')
}
let stream = null
let streamAudioAnalyse = null
let recorder = null
let mic = null
function setStream (newStream) {
  stream = newStream
  document.body.classList.remove('no-video-source')
  elems.video.srcObject = stream
  elems.video.play()
  elems.recordBtn.disabled = false
  stream.getTracks()[0].addEventListener('ended', e => {
    elems.stopStream.click()
  })
  streamAudioAnalyse = analyse(stream)
  // Returns null if there is no audio track
  if (streamAudioAnalyse) {
    elems.screenVolume.classList.add('active')
  }
  elems.stopStream.disabled = false
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
  if (recorder) {
    if (recorder.state === 'paused') {
      recorder.resume()
      document.body.classList.remove('paused')
      elems.recordBtn.title = 'Pause recording'
    } else {
      recorder.pause()
      document.body.classList.add('paused')
      elems.recordBtn.title = 'Resume recording'
    }
  } else {
    // if (mic) {
    //   for (const track of mic.stream.getTracks()) {
    //     stream.addTrack(track)
    //   }
    // }
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
    elems.recordBtn.title = 'Pause recording'
  }
})
elems.stopRecord.addEventListener('click', e => {
  if (recorder) {
    recorder.stop()
    document.body.classList.remove('recording')
    elems.stopRecord.disabled = true
    elems.recordBtn.title = 'Start recording'
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
    elems.stopStream.disabled = true
    elems.recordBtn.disabled = true
    streamAudioAnalyse = null
    elems.screenVolume.classList.remove('active')
  }
})
elems.toggleMic.addEventListener('click', async e => {
  if (mic) {
    stopStream(mic.stream)
    document.body.classList.add('mic-is-off')
    elems.micVolume.classList.remove('active')
    mic = null
    elems.toggleMic.title = 'Turn on microphone'
  } else {
    mic = {
      stream: await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    mic.analyse = analyse(mic.stream)
    document.body.classList.remove('mic-is-off')
    elems.micVolume.classList.add('active')
    elems.toggleMic.title = 'Turn off microphone'
  }
})

function updateVolume () {
  if (mic) {
    elems.micVolume.style.setProperty('--volume', mic.analyse() * 100 + '%')
  }
  if (streamAudioAnalyse) {
    elems.screenVolume.style.setProperty('--volume', streamAudioAnalyse() * 100 + '%')
  }
  window.requestAnimationFrame(updateVolume)
}
updateVolume()

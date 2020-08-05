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

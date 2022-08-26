// ESM version of /javascripts/easing.js

// linear
export function linear (t) {
  return t
}

// quadratic
export function easeInQuad (t) {
  return t * t
}
export function easeOutQuad (t) {
  return -t * (t - 2)
}
export function easeInOutQuad (t) {
  t *= 2
  if (t < 1) return (t * t) / 2
  t--
  return -(t * (t - 2) - 1) / 2
}

// cubic
export function easeInCubic (t) {
  return t * t * t
}
export function easeOutCubic (t) {
  t--
  return t * t * t + 1
}
export function easeInOutCubic (t) {
  t *= 2
  if (t < 1) return (t * t * t) / 2
  t -= 2
  return (t * t * t + 2) / 2
}

// quartic
export function easeInQuart (t) {
  return t * t * t * t
}
export function easeOutQuart (t) {
  t--
  return -(t * t * t * t - 1)
}
export function easeInOutQuart (t) {
  t *= 2
  if (t < 1) return (t * t * t * t) / 2
  t -= 2
  return -(t * t * t * t - 2) / 2
}

// quintic
export function easeInQuint (t) {
  return t * t * t * t * t
}
export function easeOutQuint (t) {
  t--
  return t * t * t * t * t + 1
}
export function easeInOutQuint (t) {
  t *= 2
  if (t < 1) return (t * t * t * t * t) / 2
  t -= 2
  return (t * t * t * t * t + 2) / 2
}

// sinusoidal
export function easeInSine (t) {
  return -Math.cos((t * Math.PI) / 2) + 1
}
export function easeOutSine (t) {
  return Math.sin((t * Math.PI) / 2)
}
export function easeInOutSine (t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

// exponential
export function easeInExpo (t) {
  return Math.pow(2, 10 * (t - 1))
}
export function easeOutExpo (t) {
  return -Math.pow(2, -10 * t) + 1
}
export function easeInOutExpo (t) {
  t *= 2
  if (t < 1) return Math.pow(2, 10 * (t - 1)) / 2
  t--
  return -Math.pow(2, -10 * t) - 1
}

// circular
export function easeInCirc (t) {
  return 1 - Math.sqrt(1 - t * t)
}
export function easeOutCirc (t) {
  t--
  return Math.sqrt(1 - t * t)
}
export function easeInOutCirc (t) {
  t *= 2
  if (t < 1) return -(Math.sqrt(1 - t * t) - 1) / 2
  t -= 2
  return (Math.sqrt(1 - t * t) + 1) / 2
}

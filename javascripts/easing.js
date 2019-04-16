/**
 * This applies to all the functions below.
 * Code adopted from http://gizma.com/easing/
 * @param {number} t The time or progress between 0 and 1
 * @return {number} The position between 0 and 1
 */

const Easing = {
  // linear
  linear(t) {
    return t;
  },

  // quadratic
  easeInQuad(t) {
    return t * t;
  },
  easeOutQuad(t) {
    return -t * (t - 2);
  },
  easeInOutQuad(t) {
    t *= 2;
  	if (t < 1) return t * t / 2;
  	t--;
  	return -(t * (t - 2) - 1) / 2;
  },

  // cubic
  easeInCubic(t) {
    return t * t * t;
  },
  easeOutCubic(t) {
    t--;
    return t * t * t + 1;
  },
  easeInOutCubic(t) {
    t *= 2;
  	if (t < 1) return t * t * t / 2;
  	t -= 2;
  	return (t * t * t + 2) / 2;
  },

  // quartic
  easeInQuart(t) {
    return t * t * t * t;
  },
  easeOutQuart(t) {
    t--;
  	return -(t * t * t * t - 1);
  },
  easeInOutQuart(t) {
    t *= 2;
  	if (t < 1) return t * t * t * t / 2;
  	t -= 2;
  	return -(t * t * t * t - 2) / 2;
  },

  // quintic
  easeInQuint(t) {
    return t * t * t * t * t;
  },
  easeOutQuint(t) {
    t--;
    return t * t * t * t * t + 1;
  },
  easeInOutQuint(t) {
    t *= 2;
  	if (t < 1) return t * t * t * t * t / 2;
  	t -= 2;
  	return (t * t * t * t * t + 2) / 2;
  },

  // sinusoidal
  easeInSine(t) {
    return -Math.cos(t * Math.PI / 2) + 1;
  },
  easeOutSine(t) {
    return Math.sin(t * Math.PI / 2);
  },
  easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  },

  // exponential
  easeInExpo(t) {
    return Math.pow(2, 10 * (t - 1));
  },
  easeOutExpo(t) {
    return -Math.pow(2, -10 * t) + 1;
  },
  easeInOutExpo(t) {
    t *= 2;
  	if (t < 1) return Math.pow(2, 10 * (t - 1)) / 2;
  	t--;
  	return -Math.pow(2, -10 * t) - 1;
  },

  // circular
  easeInCirc(t) {
    return 1 - Math.sqrt(1 - t * t);
  },
  easeOutCirc(t) {
    t--;
  	return Math.sqrt(1 - t * t);
  },
  easeInOutCirc(t) {
    t *= 2;
  	if (t < 1) return -(Math.sqrt(1 - t * t) - 1) / 2;
  	t -= 2;
  	return (Math.sqrt(1 - t * t) + 1) / 2;
  }
};

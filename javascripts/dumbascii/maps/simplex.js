const sqrt3 = Math.sqrt(3);
const skew = sqrt3 / 2 - 0.5;
const unskew = 0.5 - sqrt3 / 6;
const magicUnskew = 1 - unskew * 2;
const gradientA = [1, 1, 0, -1, -1, -1, 0, 1];
const gradientB = [0, 1, 1, 1, 0, -1, -1, -1];

function simplexNoise(tbl, x, y) {
  let mu = (x + y) * skew,
  a = Math.floor(x + mu),
  b = Math.floor(y + mu);
  mu = (a + b) * unskew;

  let offsetA = x - a + mu,
  offsetB = y - b + mu;

  let transversalA = offsetA > offsetB ? 1 : 0,
  transversalB = offsetA > offsetB ? 0 : 1;

  return simplexNoise.calcValue(tbl, a, b, offsetA, offsetB)
       + simplexNoise.calcValue(tbl, a, b, offsetA - transversalA + unskew, offsetB - transversalB + unskew, transversalA, transversalB)
       + simplexNoise.calcValue(tbl, a, b, offsetA - magicUnskew, offsetB - magicUnskew, 1, 1);
}
simplexNoise.wrap = (a, arr) => (a % arr.length + arr.length) % arr.length;
simplexNoise.calcValue = function(tbl, a, b, thingA, thingB, offA = 0, offB = 0) {
  let v = 0.5 - thingA * thingA - thingB * thingB;
  if (v > 0) {
    let index = tbl[simplexNoise.wrap(a + offA + tbl[simplexNoise.wrap(b + offB, tbl)], tbl)] % gradientA.length;
    return v ** 4 * (thingA * gradientA[index] + thingB * gradientB[index]);
  } else return 0;
};

module.exports = simplexNoise;

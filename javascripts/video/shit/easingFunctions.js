// https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts
window.easingsFunctions = (() => {

const pow = Math.pow;
const sqrt = Math.sqrt;
const sin = Math.sin;
const cos = Math.cos;
const PI = Math.PI;
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = ( 2 * PI ) / 3;
const c5 = ( 2 * PI ) / 4.5;

function bounceOut(x) {
	const n1 = 7.5625;
	const d1 = 2.75;

	if ( x < 1 / d1 ) {
		return n1 * x * x;
	} else if ( x < 2 / d1 ) {
		return n1 * (x -= (1.5 / d1)) * x + .75;
	} else if ( x < 2.5 / d1 ) {
		return n1 * (x -= (2.25 / d1)) * x + .9375;
	} else {
		return n1 * (x -= (2.625 / d1)) * x + .984375;
	}
}

const easingsFunctions = {
	easeInElastic(x) {
		return x === 0 ? 0 : x === 1 ? 1 :
			-pow( 2, 10 * x - 10 ) * sin( ( x * 10 - 10.75 ) * c4 );
	},
	easeOutElastic(x) {
		return x === 0 ? 0 : x === 1 ? 1 :
			pow( 2, -10 * x ) * sin( ( x * 10 - 0.75 ) * c4 ) + 1;
	},
	easeInOutElastic(x) {
		return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
			-( pow( 2, 20 * x - 10 ) * sin( ( 20 * x - 11.125 ) * c5 )) / 2 :
			pow( 2, -20 * x + 10 ) * sin( ( 20 * x - 11.125 ) * c5 ) / 2 + 1;
	},
	easeInBounce(x) {
		return 1 - bounceOut( 1 - x );
	},
	easeOutBounce: bounceOut,
	easeInOutBounce(x) {
		return x < 0.5 ?
			( 1 - bounceOut( 1 - 2 * x ) ) / 2 :
			( 1 + bounceOut( 2 * x - 1 ) ) / 2;
	},
};

return easingsFunctions;

})();

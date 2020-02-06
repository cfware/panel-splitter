import test from 'ava';
import calculateSize from '../calculate-size.js';

function checkCalculatedSize(t, [requestedSize, min, max, snap], result) {
	t.is(calculateSize(requestedSize, min, max, snap), result);
}

test('is a function', t => {
	t.is(typeof calculateSize, 'function');
});

test('no min, max or snap', checkCalculatedSize, [50, 0, 0, 0], 50);
test('at min', checkCalculatedSize, [50, 50, 0, 0], 50);
test('below min', checkCalculatedSize, [25, 50, 0, 0], 50);
test('at max', checkCalculatedSize, [50, 0, 50, 0], 50);
test('above max', checkCalculatedSize, [75, 0, 50, 0], 50);
test('above snap', checkCalculatedSize, [75, 0, 0, 50], 75);
test('50-100% of snap', t => {
	for (let i = 25; i <= 50; i++) {
		checkCalculatedSize(t, [i, 0, 0, 50], 50);
	}
});
test('below snap', t => {
	for (let i = 0; i <= 24; i++) {
		checkCalculatedSize(t, [i, 0, 0, 50], 0);
	}
});

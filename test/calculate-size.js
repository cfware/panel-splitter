import test from 'ava';
import calculateSize from '../calculate-size';

test('is a function', t => {
	t.is(typeof calculateSize, 'function');
});

test('no min, max or snap', t => t.is(calculateSize(50, 0, 0, 0), 50));
test('at min', t => t.is(calculateSize(50, 50, 0, 0), 50));
test('below min', t => t.is(calculateSize(25, 50, 0, 0), 50));
test('at max', t => t.is(calculateSize(50, 0, 50, 0), 50));
test('above max', t => t.is(calculateSize(75, 0, 50, 0), 50));
test('above snap', t => t.is(calculateSize(75, 0, 0, 50), 75));
test('50-100% of snap', t => {
	for (let i = 25; i <= 50; i++) {
		t.is(calculateSize(i, 0, 0, 50), 50);
	}
});
test('below snap', t => {
	for (let i = 0; i <= 24; i++) {
		t.is(calculateSize(i, 0, 0, 50), 0);
	}
});

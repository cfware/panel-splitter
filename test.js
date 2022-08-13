import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import t from 'libtap';
import {grabImage, testBrowser} from '@cfware/tap-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';

import calculateSize from './calculate-size.js';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const imageFile = fullname => path.join(
	cwd,
	'tap-snapshots',
	fullname.replace(/[^\w.-]+/gu, '-')
);

async function processImage(t, element, imageID) {
	const image64 = await grabImage(element);
	t.matchSnapshot(image64, imageID);
	await writeFile(imageFile(`${t.fullname}-${imageID}.png`), image64);
}

function executeDrag(selenium, button, from, to) {
	return selenium.executeScript((button, from, to) => {
		const element = document.querySelector('panel-splitter');
		element.dispatchEvent(new MouseEvent('mousedown', {button, screenX: from, screenY: from}));
		window.dispatchEvent(new MouseEvent('mousemove', {screenX: to, screenY: to}));
		window.dispatchEvent(new MouseEvent('mouseup', {}));
		return element.adjust;
	}, button, from, to);
}

function getStyleWidth(selenium, splitter, element) {
	return selenium.executeScript(
		(splitter, element) => splitter.vertical ? element.style.height : element.style.width,
		splitter,
		element
	);
}

async function verifyAdjustments(t, selenium, eles, adjust, position) {
	const [, before, after, splitter] = eles;

	const actualBefore = await getStyleWidth(selenium, splitter, before);
	if (adjust === 'before' || adjust === 'both') {
		t.equal(actualBefore, `${position}px`, `beforeStyle set for adjust ${adjust} to position ${position}`);
	} else {
		t.equal(actualBefore, '', `beforeStyle not set for adjust ${adjust} to position ${position}`);
	}

	const actualAfter = await getStyleWidth(selenium, splitter, after);
	if (adjust === 'after' || adjust === 'both') {
		t.equal(actualAfter, `${200 - position}px`, `beforeStyle set for adjust ${adjust} to position ${position}`);
	} else {
		t.equal(actualAfter, '', `beforeStyle not set for adjust ${adjust} to position ${position}`);
	}
}

async function resizingTest(t, selenium) {
	const eles = await Promise.all([
		selenium.findElement({id: 'test'}),
		selenium.findElement({className: 'prev'}),
		selenium.findElement({className: 'next'}),
		selenium.findElement({tagName: 'panel-splitter'})
	]);
	const [element] = eles;
	const simulateDrag = async (from, to, expected) => {
		const imageId = `from-${from}-to-${to}`;

		const adjust = await executeDrag(selenium, 0, from, to);
		await verifyAdjustments(t, selenium, eles, adjust, expected);
		await processImage(t, eles[0], imageId);
	};

	await processImage(t, element, 'initial');

	await executeDrag(selenium, 1, 100, 0);
	await processImage(t, element, 'after-button-1-drag');
	await verifyAdjustments(t, selenium, eles, 'none');

	await simulateDrag(100, 90, 90);
	await simulateDrag(90, 7, 8);
	await simulateDrag(8, 6, 8);
	await simulateDrag(8, 5, 8);
	await simulateDrag(8, 4, 8);
	await simulateDrag(8, 3, 0);
	await simulateDrag(0, 192, 192);
	await simulateDrag(192, 193, 192);
	await simulateDrag(192, 194, 192);
	await simulateDrag(192, 195, 192);
	await simulateDrag(192, 196, 192);
	await simulateDrag(192, 197, 200);
}

const pages = {
	'horizontal.html': resizingTest,
	'vertical.html': resizingTest,
	'adjust-after.html': resizingTest,
	'adjust-before.html': resizingTest
};

const daemon = new FastifyTestHelper({
	customGetters: {
		'/panel-splitter.js': 'panel-splitter.js',
		'/calculate-size.js': 'calculate-size.js'
	}
});

t.test('browsers', async t => {
	await testBrowser(t, 'firefox', daemon, pages);
	await testBrowser(t, 'chrome', daemon, pages);
});

function checkCalculatedSize(t, [requestedSize, min, max, snap], result) {
	t.equal(calculateSize(requestedSize, min, max, snap), result);
}

function testCalculatedSize(name, values, result) {
	t.test(name, async t => checkCalculatedSize(t, values, result));
}

testCalculatedSize('no min, max or snap', [50, 0, 0, 0], 50);
testCalculatedSize('at min', [50, 50, 0, 0], 50);
testCalculatedSize('below min', [25, 50, 0, 0], 50);
testCalculatedSize('at max', [50, 0, 50, 0], 50);
testCalculatedSize('above max', [75, 0, 50, 0], 50);
testCalculatedSize('above snap', [75, 0, 0, 50], 75);

t.test('50-100% of snap', async t => {
	for (let size = 25; size <= 50; size++) {
		checkCalculatedSize(t, [size, 0, 0, 50], 50);
	}
});

t.test('below snap', async t => {
	for (let size = 0; size <= 24; size++) {
		checkCalculatedSize(t, [size, 0, 0, 50], 0);
	}
});

/* global window, document, MouseEvent */
import {setup, page} from '@cfware/ava-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';
import fastifyTestHelperConfig from './_fastify-test-helper.config';

function executeDrag(selenium, button, from, to) {
	return selenium.executeScript((button, from, to) => {
		const ele = document.querySelector('panel-splitter');
		ele.dispatchEvent(new MouseEvent('mousedown', {button, screenX: from, screenY: from}));
		window.dispatchEvent(new MouseEvent('mousemove', {screenX: to, screenY: to}));
		window.dispatchEvent(new MouseEvent('mouseup', {}));
		return ele.adjust;
	}, button, from, to);
}

function getStyleWidth(selenium, splitter, ele) {
	return selenium.executeScript(
		(splitter, ele) => splitter.vertical ? ele.style.height : ele.style.width,
		splitter,
		ele
	);
}

async function verifyAdjustments(t, eles, adjust, position) {
	const {selenium} = t.context;
	const [, before, after, splitter] = eles;

	const actualBefore = await getStyleWidth(selenium, splitter, before);
	if (adjust === 'before' || adjust === 'both') {
		t.is(actualBefore, position + 'px', `beforeStyle set for adjust ${adjust} to position ${position}`);
	} else {
		t.is(actualBefore, '', `beforeStyle not set for adjust ${adjust} to position ${position}`);
	}

	const actualAfter = await getStyleWidth(selenium, splitter, after);
	if (adjust === 'after' || adjust === 'both') {
		t.is(actualAfter, (200 - position) + 'px', `beforeStyle set for adjust ${adjust} to position ${position}`);
	} else {
		t.is(actualAfter, '', `beforeStyle not set for adjust ${adjust} to position ${position}`);
	}
}

async function simulateDrag(t, eles, from, to, expected) {
	const {selenium, snapshotImage, grabImage} = t.context;
	const imageId = `from-${from}-to-${to}`;

	const adjust = await executeDrag(selenium, 0, from, to);
	await verifyAdjustments(t, eles, adjust, expected);
	await snapshotImage(eles[0], imageId);
	await grabImage(eles[0], imageId);
}

async function resizingTest(t) {
	const {selenium, snapshotImage, grabImage} = t.context;
	const eles = await Promise.all([
		selenium.findElement({id: 'test'}),
		selenium.findElement({className: 'prev'}),
		selenium.findElement({className: 'next'}),
		selenium.findElement({tagName: 'panel-splitter'})
	]);
	const [ele] = eles;

	await snapshotImage(ele, 'initial');
	await grabImage(ele, 'initial');

	await executeDrag(selenium, 1, 100, 0);
	await snapshotImage(ele, 'after-button-1-drag');
	await grabImage(ele, 'after-button-1-drag');
	await verifyAdjustments(t, eles, 'none');

	await simulateDrag(t, eles, 100, 90, 90);
	await simulateDrag(t, eles, 90, 7, 8);
	await simulateDrag(t, eles, 8, 6, 8);
	await simulateDrag(t, eles, 8, 5, 8);
	await simulateDrag(t, eles, 8, 4, 8);
	await simulateDrag(t, eles, 8, 3, 0);
	await simulateDrag(t, eles, 0, 192, 192);
	await simulateDrag(t, eles, 192, 193, 192);
	await simulateDrag(t, eles, 192, 194, 192);
	await simulateDrag(t, eles, 192, 195, 192);
	await simulateDrag(t, eles, 192, 196, 192);
	await simulateDrag(t, eles, 192, 197, 200);
}

page('horizontal.html', resizingTest);
page('vertical.html', resizingTest);
page('adjust-after.html', resizingTest);
page('adjust-before.html', resizingTest);

export function setupTesting(browserBuilder) {
	setup(new FastifyTestHelper(browserBuilder, fastifyTestHelperConfig));
}

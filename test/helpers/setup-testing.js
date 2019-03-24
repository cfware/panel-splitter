/* global window, document, MouseEvent */
import {setup, page} from '@cfware/ava-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';
import fastifyTestHelperConfig from './fastify-test-helper.config';

async function executeDrag(selenium, button, from, to) {
	await selenium.executeScript((button, from, to) => {
		const ele = document.querySelector('panel-splitter');
		ele.dispatchEvent(new MouseEvent('mousedown', {button, screenX: from, screenY: from}));
		window.dispatchEvent(new MouseEvent('mousemove', {screenX: to, screenY: to}));
		window.dispatchEvent(new MouseEvent('mouseup', {}));
	}, button, from, to);
}

async function simulateDrag(t, ele, from, to) {
	const {selenium, snapshotImage, grabImage} = t.context;
	const imageId = `from-${from}-to-${to}`;

	await executeDrag(selenium, 0, from, to);
	await snapshotImage(ele, imageId);
	await grabImage(ele, imageId);
}

async function resizingTest(t) {
	const {selenium, snapshotImage, grabImage} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	await snapshotImage(ele, 'initial');
	await grabImage(ele, 'initial');

	await executeDrag(selenium, 1, 100, 0);
	await snapshotImage(ele, 'after-button-1-drag');
	await grabImage(ele, 'after-button-1-drag');

	await simulateDrag(t, ele, 100, 90);
	await simulateDrag(t, ele, 90, 7);
	await simulateDrag(t, ele, 8, 6);
	await simulateDrag(t, ele, 8, 5);
	await simulateDrag(t, ele, 8, 4);
	await simulateDrag(t, ele, 8, 3);
	await simulateDrag(t, ele, 0, 192);
	await simulateDrag(t, ele, 192, 193);
	await simulateDrag(t, ele, 192, 194);
	await simulateDrag(t, ele, 192, 195);
	await simulateDrag(t, ele, 192, 196);
	await simulateDrag(t, ele, 192, 197);
}

page('horizontal.html', resizingTest);
page('vertical.html', resizingTest);

export function setupTesting(browserBuilder) {
	setup(new FastifyTestHelper(browserBuilder, fastifyTestHelperConfig));
}

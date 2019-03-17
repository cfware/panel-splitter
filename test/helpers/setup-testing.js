/* global window, document, MouseEvent */
import {setup, page} from '@cfware/ava-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';
import fastifyTestHelperConfig from './fastify-test-helper.config';

async function simulateDrag(t, ele, from, to) {
	const {selenium, snapshotImage, grabImage} = t.context;

	await selenium.executeScript((from, to) => {
		const ele = document.querySelector('panel-splitter');
		ele.dispatchEvent(new MouseEvent('mousedown', {screenX: from}));
		window.dispatchEvent(new MouseEvent('mousemove', {screenX: to}));
		window.dispatchEvent(new MouseEvent('mouseup', {}));
	}, from, to);

	const imageId = `from-${from}-to-${to}`;
	await snapshotImage(ele, imageId);
	await grabImage(ele, imageId);
}

async function resizingTest(t) {
	const {selenium, snapshotImage, grabImage} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	await snapshotImage(ele, 'initial');
	await grabImage(ele, 'initial');

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

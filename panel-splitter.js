import runCallbacks from '@cfware/callback-array-once';
import {ShadowElement, html, template, createBoundEventListeners} from '@cfware/shadow-element';

import calculateSize from './calculate-size.js';

function getVariableNames(vertical) {
	if (vertical) {
		return ['clientHeight', 'screenY', 'height'];
	}

	return ['clientWidth', 'screenX', 'width'];
}

class PanelSplitter extends ShadowElement {
	constructor() {
		super();

		const selectionchange = () => window.getSelection().removeAllRanges();

		this.addEventListener('mousedown', mouseDownEvent => {
			if (mouseDownEvent.button !== 0) {
				return;
			}

			const {previousElementSibling, nextElementSibling, vertical} = this;
			const [clientSize, eventVar, styleVar] = getVariableNames(vertical);
			const originalPosition = mouseDownEvent[eventVar];
			const originalNextSize = nextElementSibling[clientSize];
			const totalSize = previousElementSibling[clientSize] + originalNextSize;
			const cleanupFns = [
				() => this.dispatchEvent(new Event('moved'))
			];

			const handlers = {
				mousemove: event => {
					const requestNext = originalPosition + originalNextSize - event[eventVar];
					let calcNext = calculateSize(requestNext, this.minNext, this.maxNext, this.snapNext);
					const requestPrevious = totalSize - calcNext;
					const calcPrevious = calculateSize(requestPrevious, this.minPrev, this.maxPrev, this.snapPrev);

					if (requestPrevious !== calcPrevious) {
						calcNext = totalSize - calcPrevious;
					}

					if (this.adjust !== 'after') {
						previousElementSibling.style[styleVar] = `${calcPrevious}px`;
					}

					if (this.adjust !== 'before') {
						nextElementSibling.style[styleVar] = `${calcNext}px`;
					}
				}
			};

			['blur', 'mouseup', 'mouseleave'].forEach(type => {
				handlers[type] = () => runCallbacks(cleanupFns);
			});

			selectionchange();
			cleanupFns.push(
				...this[createBoundEventListeners](document, {selectionchange}),
				...this[createBoundEventListeners](window, handlers)
			);
		});
	}

	get [template]() {
		return html`
			<style>
				:host {
					cursor: col-resize;
					user-select: none;
					min-width: 4px;
					min-height: 4px;
				}

				:host([vertical]) {
					cursor: row-resize;
				}
			</style>
		`;
	}
}

PanelSplitter.define('panel-splitter', {
	stringProps: {
		adjust: 'both'
	},
	booleanProps: ['vertical'],
	numericProps: {
		snapPrev: 8,
		minPrev: 0,
		maxPrev: 0,
		snapNext: 8,
		minNext: 0,
		maxNext: 0
	}
});

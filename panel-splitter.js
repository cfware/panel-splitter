import runCallbacks from '@cfware/callback-array-once';
import ShadowElement, {html, template, css, adoptedStyleSheets, createBoundEventListeners, define, reflectStringProperties, reflectBooleanProperties, reflectNumericProperties} from '@cfware/shadow-element';

import calculateSize from './calculate-size.js';

const getVariableNames = vertical => {
    if (vertical) {
        return ['clientHeight', 'screenY', 'height'];
    }

    return ['clientWidth', 'screenX', 'width'];
};

class PanelSplitter extends ShadowElement {
    constructor() {
        super();

        const selectionchange = () => window.getSelection().removeAllRanges();

        this.addEventListener('mousedown', mouseDownEvent => {
            if (mouseDownEvent.button !== 0) {
                return;
            }

            const {previousElementSibling, nextElementSibling, vertical} = this;
            const [clientSize, eventVariable, styleVariable] = getVariableNames(vertical);
            const originalPosition = mouseDownEvent[eventVariable];
            const originalNextSize = nextElementSibling[clientSize];
            const totalSize = previousElementSibling[clientSize] + originalNextSize;
            const cleanupFns = [
                () => this.dispatchEvent(new Event('moved'))
            ];

            const handlers = {
                mousemove: event => {
                    const requestNext = originalPosition + originalNextSize - event[eventVariable];
                    let calcNext = calculateSize(requestNext, this.minNext, this.maxNext, this.snapNext);
                    const requestPrevious = totalSize - calcNext;
                    const calcPrevious = calculateSize(requestPrevious, this.minPrev, this.maxPrev, this.snapPrev);

                    if (requestPrevious !== calcPrevious) {
                        calcNext = totalSize - calcPrevious;
                    }

                    if (this.adjust !== 'after') {
                        previousElementSibling.style[styleVariable] = `${calcPrevious}px`;
                    }

                    if (this.adjust !== 'before') {
                        nextElementSibling.style[styleVariable] = `${calcNext}px`;
                    }
                }
            };

            for (const type of ['blur', 'mouseup', 'mouseleave']) {
                handlers[type] = () => runCallbacks(cleanupFns);
            }

            selectionchange();
            cleanupFns.push(
                ...this[createBoundEventListeners](document, {selectionchange}),
                ...this[createBoundEventListeners](window, handlers)
            );
        });
    }

    static [adoptedStyleSheets] = [
        css`
            :host {
                cursor: col-resize;
                user-select: none;
                min-width: 4px;
                min-height: 4px;
            }

            :host([vertical]) {
                cursor: row-resize;
            }
        `
    ];

    get [template]() {
        return html``;
    }
}

reflectBooleanProperties(PanelSplitter, ['vertical']);
reflectStringProperties(PanelSplitter, {adjust: 'both'});
reflectNumericProperties(PanelSplitter, {
    snapPrev: 8,
    minPrev: 0,
    maxPrev: 0,
    snapNext: 8,
    minNext: 0,
    maxNext: 0
});
PanelSplitter[define]('panel-splitter');

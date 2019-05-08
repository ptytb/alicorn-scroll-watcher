/*
  alicorn-scroll-watcher-mixin.html
  A mixin that provides scroll watching capabilities to a web component
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
// Singleton class to handle requestAnimationFrame for scroll watching
let singleton = Symbol();
class ScrollWatcherWorker {
  constructor() {
    this.scrollTargets = [];
    this.watchedElements = [];
    this.addScrollTarget(window.document.documentElement);
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new ScrollWatcherWorker();
      this[singleton].loop();
    }
    return this[singleton];
  }

  loop() {
    if (this.scrollTargets.length !== 0) {
      this.scrollTargets.forEach(t => {
        if (this.handleScroll(t)) {
          this.watchedElements
            .filter(e => e.target === t.element)
            .forEach(e => e.element._updateScroll(t.viewport));
        }
      });
      this.watchedElements.forEach(e => {
        var target = this.scrollTargets.find(
          t => t.changed && t.element === e.target
        );
        if (target && e.element._updateScroll) {
          e.element._updateScroll([target.top, target.height]);
        }
      });
    }
    window.requestAnimationFrame(() => this.loop());
  }

  addScrollTarget(element) {
    if (!this.scrollTargets.find(t => t.element === element)) {
      var target = {
        element: element,
        viewport: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          height: 0,
          width: 0
        }
      };
      this.handleScroll(target);
      this.scrollTargets.push(target);
    }
  }

  removeScrollTarget(element) {
    if (
      element === window.document.documentElement // ignore removing root document
    )
      return;
    var index = this.scrollTargets.findIndex(t => t.element === element);
    if (index >= 0 && !this.watchedElements.some(e => e.target === element))
      this.scrollTargets.splice(index, 1);
  }

  addWatchedElement(element, target) {
    if (!this.watchedElements.find(e => e.element === element)) {
      target = target || window.document.documentElement;
      this.watchedElements.push({
        element: element,
        target: target
      });
      if (target !== window.document.documentElement)
        this.addScrollTarget(target);
    }
  }

  removeWatchedElement(element) {
    var index = this.watchedElements.findIndex(e => e.element === element);
    if (index >= 0) {
      this.removeScrollTarget(this.watchedElements[index].target);
      this.watchedElements.splice(index, 1);
    }
  }

  changeWatchedElementTarget(element, target) {
    var watched = this.watchedElements.find(e => e.element === element);
    if (watched === undefined) {
      this.addWatchedElement(element, target);
    } else if (watched.target !== target) {
      this.removeScrollTarget(watched.target);
      if (target !== window.document.documentElement)
        this.addScrollTarget(target);
      watched.target = target;
    }

    var t = this.scrollTargets.find(e => e.element === target);
    element._updateScroll(t.viewport);
  }

  /**
   * Updates the viewport of the target element.
   * @param {*} target
   * @returns {boolean} true if the scroll changed, false otherwise.
   */
  handleScroll(target) {
    var left = target.element === window.document.documentElement
      ? window.pageXOffset ||
          window.document.documentElement.scrollLeft ||
          window.document.body.scrollLeft
      : target.element.scrollLeft;
    var top = target.element === window.document.documentElement
      ? window.pageYOffset ||
          window.document.documentElement.scrollTop ||
          window.document.body.scrollTop
      : target.element.scrollTop;
    var height = (target.element === window.document.documentElement
      ? window.innerHeight || window.document.documentElement.clientHeight
      : target.clientHeight) || 0;
    var width = (target.element === window.document.documentElement
      ? window.innerWidth || window.document.documentElement.clientWidth
      : target.clientWidth) || 0;
    if (
      target.viewport.top === top &&
      target.viewport.height === height &&
      target.viewport.left === left &&
      target.viewport.width === width
    )
      return false;
    else {
      target.viewport.top = top;
      target.viewport.Left = left;
      target.viewport.height = height;
      target.viewport.width = width;
      target.viewport.bottom = top + height;
      target.viewport.right = left + width;
      return true;
    }
  }
}
export const AlicornScrollWatcherMixin = dedupingMixin(base => {
  if(base === undefined)
    base = PolymerElement;
  return class extends base {
    /**
     * Fired when any part of `element` enters the viewport.
     *
     * @event enter-viewport
     */

    /**
     * Fired when `element` fully exits the viewport.
     *
     * @event exit-viewport
     */

    /**
     * Fired when `element` partially exits the viewport.
     *
     * @event partially-exit-viewport
     */

    /**
     * Fired when `element` fully enters the viewport.
     *
     * @event fully-enter-viewport
     */

    /**
     * Fired when any other event is triggered.
     *
     * @event viewport-state-changed
     */

    static get properties() {
      return {
        /**
         * Specifies the element that will handle the scroll event
         * on the behalf of the current element. This is typically a reference to an element,
         * but there are a few more posibilities:
         *
         * ### Elements id
         *
         *```html
         * <div id="scrollable-element" style="overflow: auto;">
         *  <x-element scroll-target="scrollable-element">
         *    <!-- Content-->
         *  </x-element>
         * </div>
         *```
         * In this case, the `scrollTarget` will point to the outer div element.
         *
         * ### Document scrolling
         *
         * For document scrolling, you can use the reserved word `document`:
         *
         *```html
         * <x-element scroll-target="document">
         *   <!-- Content -->
         * </x-element>
         *```
         *
         * ### Elements reference
         *
         *```js
         * appHeader.scrollTarget = document.querySelector('#scrollable-element');
         *```
         *
         * @type {HTMLElement}
         * @default document
         */
        scrollTarget: {
          type: HTMLElement,
          observer: '_scrollTargetChanged'
        },

        /**
         * Change the offset in pixels at which events will fire.
         * 
         * This is treated as an offset outside of the element.
         * 
         * This applies equally to the top and bottom of the element.
         * If you want to set different top and bottom offsets set offset to a space seperated
         * list of "top bottom".
         */
        offset: {
          type: String,
          value: '0',
          observer: '_offsetChanged'
        },

        /**
         * Lock the current location for scroll calculations.
         */
        lock: {
          type: Boolean,
          reflectToAttribute: true,
          observer: '_lockChanged'
        }
      };
    }

    constructor() {
      super();
      this.scrollTarget = this.ownerDocument.documentElement;
      this.__offsetTop = 0;
      this.__offsetBottom = 0;
      this.__lockedRect = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0
      };
      this.isAboveViewport = false;
      this.isBelowViewport = false;
      this.isInViewport = true;
      this.isFullyInViewport = true;
      this.__wasAboveViewport = false;
      this.__wasBelowViewport = false;
      this.__wasInViewport = true;
      this.__wasFullyInViewport = true;
    }

    connectedCallback() {
      super.connectedCallback();
      // need to set __lockedRect here so that scroll on reload is accounted for and movement of the element.
      if (this.lock) {
        var rect = this.getBoundingClientRect();
        var targetTop = this.scrollTarget === window.document.documentElement ? window.pageYOffset : this.scrollTarget.offsetTop;
        var targetLeft = this.scrollTarget === window.document.documentElement ? window.pageXOffset : this.scrollTarget.offsetLeft;
        this.__lockedRect.left = rect.left + targetLeft;
        this.__lockedRect.top = rect.top + targetTop;
        this.__lockedRect.bottom = rect.bottom + targetTop;
        this.__lockedRect.right = rect.right + targetLeft;
        this.__lockedRect.width = rect.width;
        this.__lockedRect.height = rect.height;
      }
    }

    disconnectedCallback(){
      super.disconnectedCallback();
      ScrollWatcherWorker.instance.removeWatchedElement(this);
    }

    _scrollTargetChanged(newValue, oldValue) {
      if (newValue === oldValue)
        return;
      var target = newValue;
      if (typeof newValue === 'string') {
        target = this.ownerDocument.querySelector('#' + newValue);
        if(target !==undefined)
          this.scrollTarget = target;
        return;
      }
      if (target === undefined)
        return;
      ScrollWatcherWorker.instance.changeWatchedElementTarget(this, target);
    }

    _offsetChanged(newValue, oldValue) {
      var values = newValue.split(' ').map(v => parseInt(v));
      if (values.some(v => isNaN(v)))
        return;

      if (values.length == 1) {
        this.__offsetTop = values[0];
        this.__offsetBottom = values[0];
      }
      else if (values.length == 2) {
        this.__offsetTop = values[0];
        this.__offsetBottom = values[1];
      }
    }

    _lockChanged(newValue, oldValue) {
      if (newValue == oldValue)
        return;
      if (newValue == true) {
        var rect = this.getBoundingClientRect();
        var targetTop = this.scrollTarget === window.document.documentElement ? window.pageYOffset : this.scrollTarget.offsetTop;
        var targetLeft = this.scrollTarget === window.document.documentElement ? window.pageXOffset : this.scrollTarget.offsetLeft;
        this.__lockedRect.left = rect.left + targetLeft;
        this.__lockedRect.top = rect.top + targetTop;
        this.__lockedRect.bottom = rect.bottom + targetTop;
        this.__lockedRect.right = rect.right + targetLeft;
        this.__lockedRect.width = rect.width;
        this.__lockedRect.height = rect.height;
      }
    }

    /**
     * Runs on every scroll event. Children of this mixin may override this method.
     *
     * @protected
     */
    _scrollHandler() { }

    _updateScroll(viewport) {
      var boundingRect = this.lock ? this.__lockedRect : this.getBoundingClientRect();
      var targetTop = this.lock ? 0 : this.scrollTarget === window.document.documentElement ? window.pageYOffset : this.scrollTarget.offsetTop;
      var top = boundingRect.top + targetTop - this.__offsetTop;
      var bottom = boundingRect.bottom + targetTop + this.__offsetBottom;
      this.isAboveViewport = top < viewport.top;
      this.isBelowViewport = bottom > viewport.bottom;
      this.isInViewport = top <= viewport.bottom && bottom >= viewport.top;
      this.isFullyInViewport = (top >= viewport.top && bottom <= viewport.bottom) || (this.isAboveViewport && this.isBelowViewport);

      var wasAboveViewport = this.__wasAboveViewport;
      var wasBelowViewport = this.__wasBelowViewport;
      var wasInViewport = this.__wasInViewport;
      var wasFullyInViewport = this.__wasFullyInViewport;
      var change = false;
      if (this.isInViewport && !wasInViewport) {
        change = true;
        this.__wasInViewport = true;
        this.dispatchEvent(new CustomEvent('enter-viewport', { bubbles: true, composed: true }));
      }
      if (!this.isInViewport && wasInViewport) {
        change = true;
        this.__wasInViewport = false;
        this.dispatchEvent(new CustomEvent('exit-viewport', { bubbles: true, composed: true }));
      }
      if (!this.isFullyInViewport && wasFullyInViewport) {
        change = true;
        this.__wasFullyInViewport = false;
        this.dispatchEvent(new CustomEvent('partially-exit-viewport', { bubbles: true, composed: true }));
      }
      if (this.isFullyInViewport && !wasFullyInViewport) {
        change = true;
        this.__wasFullyInViewport = true;
        this.dispatchEvent(new CustomEvent('fully-enter-viewport', { bubbles: true, composed: true }));
      }

      if (change)
        this.dispatchEvent(new CustomEvent('viewport-state-changed', { bubbles: true, composed: true }));
      this._scrollHandler();
    }
  };
});

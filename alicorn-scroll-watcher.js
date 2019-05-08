/**
  alicorn-scroll-watcher
  A web component requestAnimationFrame based scroll watcher

  @demo demo/simple.html
  @demo demo/locked.html
  */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import {AlicornScrollWatcherMixin} from './alicorn-scroll-watcher-mixin';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="alicorn-scroll-watcher">
  <style>
    :host {
    display: block;
  }
  </style>
  <slot></slot>
</template>`;

document.head.appendChild($_documentContainer.content);
class AlicornScrollWatcher extends AlicornScrollWatcherMixin(PolymerElement) {
  static get is() { return 'alicorn-scroll-watcher'; }
}

customElements.define(AlicornScrollWatcher.is, AlicornScrollWatcher);

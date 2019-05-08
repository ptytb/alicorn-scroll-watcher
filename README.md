[![Build Status](https://travis-ci.org/mlunnay/alicorn-scroll-watcher-p3.svg?branch=master)](https://travis-ci.org/mlunnay/alicorn-scroll-watcher-p3) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/mlunnay/alicorn-scroll-watcher-p3)

_[Demo and API docs](https://www.webcomponents.org/element/mlunnay/alicorn-scroll-watcher-p3)_

# &lt;alicorn-scroll-watcher-p3&gt; 
alicorn-scroll-watcher-p3 provides a mixin and custom element that generate events based on its position inside the parent document, or a specified target element. For performance it uses requestAnimationFrame, over scroll events.

Converted to *Polymer 3* from the original [mlunnay/alicorn-scroll-watcher](https://github.com/mlunnay/alicorn-scroll-watcher)

## Installation
### NPM
```bash
npm install alicorn-scroll-watcher-p3
```
### Yarn
```bash
yarn add alicorn-scroll-watcher-p3
```

## Import
```javascript
import 'alicorn-scroll-watcher-p3';
```

## Usage
The alicorn-scroll-watcher-p3 element fires events for when it enters or exits the target viewport.
```html 
<alicorn-scroll-watcher on-enter-viewport="_loadMoreData"></alicorn-scroll-watcher>
```

### Events

#### viewport-state-changed
This fires when any of the other events fire.

#### enter-viewport
This fires when any part of the element enters the target viewport.

#### fully-enter-viewport
This fires when all of the element is fully inside the target viewport.

#### exit-viewport
This fires when all of the element has exited the target viewport.

#### partially-exit-viewport
This fires when any part of the element has exited the target viewport.

### Mixin
A mixin class AlicornScrollWatcherMixin can be extended by custom elements. The `_scrollHandler` method is called whenever the target viewport changed and can be overridden to add scroll logic.

```javascript
import {AlicornScrollWatcherMixin} from 'alicorn-scroll-watcher-p3/alicorn-scroll-watcher-mixin';

class MyElement extends AlicornScrollWatcherMixin(PolymerElement) {
//...
    _scrollHandler() {
      //...
    }
}
```

## History
v1.0.0 Initial version

## License
[MIT](https://cdn.rawgit.com/mlunnay/alicorn-scroll-watcher/9cc23971/LICENSE.txt) License © Michael Lunnay
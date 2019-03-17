# @cfware/panel-splitter

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge][gk-image]](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

Draggable panel splitter web component.


### Install @cfware/panel-splitter

```sh
npm i @cfware/panel-splitter
```


## Usage

Import to your application:
```js
import '@cfware/panel-splitter';
```

Use to create split panels:
```html
<div class="container">
	<div>left panel</div>
	<panel-splitter style="background:#888"></panel-splitter>
	<div>right panel</div>
</div>
```

The application is responsible for initial sizing of the container and panels.


## Running tests

Tests are provided by xo and ava.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/@cfware/panel-splitter.svg
[npm-url]: https://npmjs.org/package/@cfware/panel-splitter
[travis-image]: https://travis-ci.org/cfware/panel-splitter.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/panel-splitter
[gk-image]: https://badges.greenkeeper.io/cfware/panel-splitter.svg
[downloads-image]: https://img.shields.io/npm/dm/@cfware/panel-splitter.svg
[downloads-url]: https://npmjs.org/package/@cfware/panel-splitter
[license-image]: https://img.shields.io/npm/l/@cfware/panel-splitter.svg

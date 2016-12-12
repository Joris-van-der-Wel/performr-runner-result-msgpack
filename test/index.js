'use strict';

const {describe, it} = require('mocha-sugar-free');
const {assert} = require('chai');

const packageExports = require('../lib');

describe('performr-runner-result-msgpack', () => {
    it('should expose all of the side effect free methods of msgpack5', () => {
        assert.isFunction(packageExports.encode);
        assert.isFunction(packageExports.decode);
        assert.isFunction(packageExports.objectEncoder);
        assert.isFunction(packageExports.objectDecoder);
    });

    it('should return a Transform Stream for encoder()', () => {
        const stream = packageExports.objectEncoder();
        assert.strictEqual(stream._readableState.objectMode, true);
        assert.strictEqual(stream._writableState.objectMode, true);
        assert.isFunction(stream.write);
        assert.isFunction(stream.end);
        assert.isFunction(stream.pipe);
        assert.isFunction(stream.read);
        assert.isFunction(stream.on);
    });

    it('should return a Transform Stream for decoder()', () => {
        const stream = packageExports.objectDecoder();
        assert.strictEqual(stream._readableState.objectMode, true);
        assert.strictEqual(stream._writableState.objectMode, true);
        assert.isFunction(stream.write);
        assert.isFunction(stream.end);
        assert.isFunction(stream.pipe);
        assert.isFunction(stream.read);
        assert.isFunction(stream.on);
    });
});

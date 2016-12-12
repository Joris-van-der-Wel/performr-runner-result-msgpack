'use strict';

const {describe, it} = require('mocha-sugar-free');
const {assert} = require('chai');

const {check, encode, decode} = require('../lib/dataURL');
const {encode: encodeDocument, decode: decodeDocument} = require('../lib');


describe('dataURL', () => {
    describe('registerEncoder() -> check()', () => {
        it('should return false for non objects', () => {
            assert.isFalse(check());
            assert.isFalse(check(false));
            assert.isFalse(check(null));
            assert.isFalse(check(0));
            assert.isFalse(check(123));
            assert.isFalse(check('foo'));
        });

        it('should return false for objects with an invalid structure', () => {
            assert.isFalse(check({}));
            assert.isFalse(check({foo: 123}));
            assert.isFalse(check({dataURL: false}));
            assert.isFalse(check({dataURL: true}));
            assert.isFalse(check({data: 123, dataURL: true}));
            assert.isFalse(check({data: 'bla', dataURL: true}));
        });

        it('should return false for unsupported data urls', () => {
            assert.isFalse(check({data: 'data:invalid', dataURL: true}));
            assert.isFalse(check({data: 'data:,foo', dataURL: true}), 'only a data url with a mime-type is supported');
            assert.isFalse(check({data: 'data:;base64,foo', dataURL: true}), 'only a data url with a mime-type is supported');
            assert.isFalse(check({data: 'data:image/jpeg,foo', dataURL: true}));
            assert.isFalse(check({data: 'data:image/jpeg;,foo', dataURL: true}));
            assert.isFalse(check({data: 'data:image/jpeg;base2,foo', dataURL: true}), 'only base64 is supported');
        });

        it('should return false for objects with too many properties', () => {
            assert.isFalse(check({data: 'data:image/jpeg;base64,foo', dataURL: true, foo: 'bar'}));
        });

        it('should return true for objects with the expected structure and a supported data url', () => {
            assert.isTrue(check({data: 'data:image/jpeg;base64,foo', dataURL: true}));
            assert.isTrue(check({data: 'data:image/jpeg;base64,', dataURL: true}), 'data of 0 bytes should be supported');
            assert.isTrue(check({data: 'data:text/html; charset=utf-8; base64,foo', dataURL: true}));
        });
    });

    describe('registerEncoder() -> encode()', () => {
        it('should properly encode a data url with a payload length of 0', () => {
            const buffer = encode({data: 'data:image/jpeg;base64,', dataURL: true});

            assert.deepEqual([...buffer], [
                0x0, // type
                0x1, // version
                0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67, // image/jpeg in utf-8
                0x0, // null byte at the end of the mime type
            ]);
        });

        it('should properly encode a data url with payload length greater than 0', () => {
            const buffer = encode({data: 'data:text/plain;base64,ur66vg==', dataURL: true});

            assert.deepEqual([...buffer], [
                0x0, // type
                0x1, // version
                0x74, 0x65, 0x78, 0x74, 0x2f, 0x70, 0x6c, 0x61, 0x69, 0x6e, // text/plain in utf-8
                0x0, // null byte at the end of the mime type
                0xba, 0xbe, 0xba, 0xbe, // the data
            ]);
        });
    });

    describe('registerDecoder() -> decode()', () => {
        it('should throw for an invalid version', () => {
            assert.throws(() => decode(Buffer.from([
                0x0, // version
                0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67,
                0x0,
            ])), /Unsupported version/i);

            assert.throws(() => decode(Buffer.from([
                0x2, // version
                0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67,
                0x0,
            ])), /Unsupported version/i);
        });

        it('should throw if the null byte at the end of the mimeType is missing', () => {
            assert.throws(() => decode(Buffer.from([
                0x1, // version
                0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67,
            ])), /find.*end.*mime-?type/i);
        });

        it('should properly decode a structure with a payload length of 0', () => {
            const buffer = Buffer.from([
                0x1, // version
                0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67, // image/jpeg in utf-8
                0x0, // null byte at the end of the mime type
            ]);

            assert.deepEqual(decode(buffer), {
                data: 'data:image/jpeg;base64,',
                dataURL: true,
            });
        });

        it('should properly decode a structure with a payload length greater than 0', () => {
            const buffer = Buffer.from([
                0x1, // version
                0x74, 0x65, 0x78, 0x74, 0x2f, 0x70, 0x6c, 0x61, 0x69, 0x6e, // text/plain in utf-8
                0x0, // null byte at the end of the mime type
                0xba, 0xbe, 0xba, 0xbe, // the data
            ]);

            assert.deepEqual(decode(buffer), {
                data: 'data:text/plain;base64,ur66vg==',
                dataURL: true,
            });
        });
    });

    describe('msgpackNS.encode()', () => {
        it('should properly encode an entire document containing the dataURL type', () => {
            const buffer = encodeDocument({
                stuff: [
                    'bar',
                    {
                        data: 'data:text/plain;base64,ur66vg==',
                        dataURL: true,
                    },
                    'baz',
                ],
            });

            assert.deepEqual([...buffer], [
                0x81, // fixmap N = 0x81 & 0x0f = 1
                0xa5, // fixstr N = 0xa5 & 0x1f = 5
                0x73, 0x74, 0x75, 0x66, 0x66, // "stuff"
                0x93, // fixarray N = 0x93 & 0x0f = 3
                0xa3, // fixstr N = 0xa3 & 0x1f = 3
                0x62, 0x61, 0x72, // "bar"
                0xd8, // fixext 16 (1 byte type + 16 bytes of data)
                // the dataURL structure:
                0x0,
                0x1,
                0x74, 0x65, 0x78, 0x74, 0x2f, 0x70, 0x6c, 0x61, 0x69, 0x6e,
                0x0,
                0xba, 0xbe, 0xba, 0xbe,
                // end of the dataURL structure
                0xa3, // fixstr N = 0xa3 & 0x1f = 3
                0x62, 0x61, 0x7a, // "baz"
            ]);
        });
    });

    describe('msgpackNS.decode()', () => {
        it('should properly decode an entire buffer of a document containing the dataURL type', () => {
            const object = decodeDocument(Buffer.from([
                0x81, // fixmap N = 0x81 & 0x0f = 1
                0xa5, // fixstr N = 0xa5 & 0x1f = 5
                0x73, 0x74, 0x75, 0x66, 0x66, // "stuff"
                0x93, // fixarray N = 0x93 & 0x0f = 3
                0xa3, // fixstr N = 0xa3 & 0x1f = 3
                0x62, 0x61, 0x72, // "bar"
                0xd8, // fixext 16 (1 byte type + 16 bytes of data)
                // the dataURL structure:
                0x0,
                0x1,
                0x74, 0x65, 0x78, 0x74, 0x2f, 0x70, 0x6c, 0x61, 0x69, 0x6e,
                0x0,
                0xba, 0xbe, 0xba, 0xbe,
                // end of the dataURL structure
                0xa3, // fixstr N = 0xa3 & 0x1f = 3
                0x62, 0x61, 0x7a, // "baz"
            ]));

            assert.deepEqual(object, {
                stuff: [
                    'bar',
                    {
                        data: 'data:text/plain;base64,ur66vg==',
                        dataURL: true,
                    },
                    'baz',
                ],
            });
        });
    });
});

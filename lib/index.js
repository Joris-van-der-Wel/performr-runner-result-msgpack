'use strict';

const msgpack = require('msgpack5')();

const dataURL = require('./dataURL');
const {DATA_URL_TYPE} = require('./types');

msgpack.registerEncoder(dataURL.check, dataURL.encode);
msgpack.registerDecoder(DATA_URL_TYPE, dataURL.decode);
exports.encode = object => msgpack.encode(object);
exports.decode = buf => msgpack.decode(buf);
exports.objectEncoder = () => msgpack.encoder();
exports.objectDecoder = () => msgpack.decoder();

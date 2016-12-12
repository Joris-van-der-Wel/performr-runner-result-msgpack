#!/usr/bin/env node
'use strict';

const {objectDecoder: createDecoder} = require('../lib');

const decoder = createDecoder();
decoder.on('data', obj => {
    console.log(JSON.stringify(obj, null, 2));
});
process.stdin.pipe(decoder);

#!/usr/bin/env node
'use strict';

const JSONParser = require('jsonparse');

const {objectEncoder: createEncoder} = require('../lib');

const readJSONParser = new JSONParser();
const encoder = createEncoder();

readJSONParser.onValue = value => {
    if (readJSONParser.stack.length === 0) { // full object
        encoder.write(value);
    }
};

encoder.pipe(process.stdout);
process.stdin.on('data', chunk => readJSONParser.write(chunk));


process.on('exit', (code) => {
    if (readJSONParser.stack.length && code === 0) {
        console.error('Received an incomplete json document!');
    }
});

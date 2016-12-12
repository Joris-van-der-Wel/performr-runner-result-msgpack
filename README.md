# performr-runner-result-msgpack
Encode/decode performr-runner result json documents from/into a binary format using [msgpack](http://msgpack.org/).

## Example
```javascript
const {encode, decode} = require('performr-runner-result-msgpack');
const fs = require('fs');

const resultObject = JSON.parse(fs.readFileSync('myResult.json'));
const buffer = encode(resultObject);
const resultObjectAgain = decode(buffer);
```

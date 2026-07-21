import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Drake = require('../../dist/js/drake.js');

assert.equal(Drake.util.isDocument({ nodeType: 9 }), true);
assert.equal(Drake.util.isElement({ nodeType: 1 }), true);
assert.equal(Drake.util.isNode({ nodeType: 3 }), true);
assert.equal(Drake.util.isNode(null), false);
assert.deepEqual(Drake.util.toNodes(null), []);

console.log('Node runtime smoke test passed without browser globals.');

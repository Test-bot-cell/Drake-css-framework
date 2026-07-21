import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const UIkit = require('../../dist/js/uikit.js');

assert.equal(UIkit.util.isDocument({ nodeType: 9 }), true);
assert.equal(UIkit.util.isElement({ nodeType: 1 }), true);
assert.equal(UIkit.util.isNode({ nodeType: 3 }), true);
assert.equal(UIkit.util.isNode(null), false);
assert.deepEqual(UIkit.util.toNodes(null), []);

console.log('Node runtime smoke test passed without browser globals.');

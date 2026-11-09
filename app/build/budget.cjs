const { readFileSync } = require('node:fs');
const { gzipSync } = require('node:zlib');
const assert = require('node:assert/strict');

const bundle = readFileSync(process.argv[2]);
const gzip = gzipSync(bundle, { level: 9 }).length;
assert.ok(bundle.length <= 5_100_000, 'JS paketi 5.100.000 baytı aşıyor: ' + bundle.length);
assert.ok(gzip <= 1_560_000, 'JS gzip paketi 1.560.000 baytı aşıyor: ' + gzip);
console.log(JSON.stringify({ javascriptBytes: bundle.length, gzipBytes: gzip }));

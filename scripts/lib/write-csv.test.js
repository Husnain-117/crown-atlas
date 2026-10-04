const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeCsv } = require('./write-csv');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crownlast-csv-'));
const outputPath = path.join(directory, 'test.csv');

try {
  writeCsv(
    [
      { Name: 'A, B', Value: 42, Notes: 'He said "hi"' },
      { Name: 'Plain', Value: null, Notes: 'Line\nbreak' },
    ],
    outputPath,
  );

  assert.equal(
    fs.readFileSync(outputPath, 'utf8'),
    'Name,Value,Notes\n"A, B",42,"He said ""hi"""\nPlain,,"Line\nbreak"\n',
  );
  console.log('writeCsv: all assertions passed');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

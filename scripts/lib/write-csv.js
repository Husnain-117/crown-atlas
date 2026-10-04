const fs = require('fs');

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';

  const stringValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function writeCsv(rows, outputPath) {
  if (!Array.isArray(rows) || rows.length === 0) {
    fs.writeFileSync(outputPath, '', 'utf8');
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(','),
    ),
  ];

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

module.exports = { writeCsv };

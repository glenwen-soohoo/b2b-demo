const XLSX = require('xlsx');
const wb = XLSX.readFile('../架構ref/2026業務部記事本.xlsx');
console.log('Sheets:', wb.SheetNames);
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log('\n=== Sheet:', name, '===');
  data.slice(0, 80).forEach((row, i) => {
    const hasContent = row.some(c => c !== '' && c !== null && c !== undefined);
    if (hasContent) console.log((i+1) + ' | ' + row.join(' | '));
  });
});

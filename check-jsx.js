const fs = require('fs');
const lines = fs.readFileSync('app/(app)/user-management/page.tsx', 'utf8').split('\n');

// Check bracket balance around form area (lines 530-720)
let open = 0, close = 0, errors = [];
for (let i = 529; i < 720 && i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === '{') open++;
    if (ch === '}') close++;
  }
  if (close > open + 5) { errors.push(`Line ${i+1}: close > open by ${close-open}`); break; }
}
console.log('Open braces:', open, 'Close braces:', close);
console.log('Errors:', errors.length ? errors : 'none');

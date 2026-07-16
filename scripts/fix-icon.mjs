import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Current state: lines 493-499 have extra nesting
// Need to fix: collapse the double div into single div with relative wrapper inside
const oldBlock = ' <div>\n' +
  ' <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Tháng Năm Sinh</label>\n' +
  ' <div className="relative">\n' +
  ' <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">📅</span>\n' +
  ' <input type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900" />\n' +
  ' </div>\n' +
  ' </div>';

const newBlock = ' <div>\n' +
  ' <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Tháng Năm Sinh</label>\n' +
  ' <div className="relative">\n' +
  ' <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">📅</span>\n' +
  ' <input type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900" />\n' +
  ' </div>\n' +
  ' </div>';

console.log('Old block exists:', c.includes(oldBlock));
// They are the same now, but the issue is the leading space on line 493 makes it:
// actual: " <div>\n <label..."
// but previous context ends with: "...text-gray-900\" />\n</div>\n\n <div>"
// So we have an extra blank line then <div> which is fine

// Actually let me check if the structure is correct by reading
console.log('Checking lines 490-502...');
const lines = c.split('\n');
for (let i = 490; i <= 502; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}

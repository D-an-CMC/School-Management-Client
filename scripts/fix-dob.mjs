import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Change label to "Ngày Tháng Năm Sinh"
c = c.replace(
  '<label className="block text-xs font-semibold text-gray-700 mb-1">Ngày sinh</label>',
  '<label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Tháng Năm Sinh</label>'
);

// Change input type back to date
c = c.replace(
  'type="text" value={formDob}',
  'type="date" value={formDob}'
);

fs.writeFileSync(p, c, 'utf8');

const f = fs.readFileSync(p, 'utf8');
console.log('Label:', f.includes('Ngày Tháng Năm Sinh'));
console.log('type=date:', (f.match(/type="date"/g) || []).length);
console.log('Done!');

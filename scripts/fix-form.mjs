import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove the Tên đăng nhập JSX block (label + input lines)
const jsxBlock = `<label className="block text-xs font-semibold text-gray-700 mb-1">Tên đăng nhập</label>\n    <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" placeholder="Tên đăng nhập" />`;
if (c.includes(jsxBlock)) {
  c = c.replace(jsxBlock, '');
  console.log('Removed Tên đăng nhât JSX block');
}

// 2. Change date input from type="date" to type="text"
c = c.replace(
  '<input type="date" value={formDob}',
  '<input type="text" value={formDob}'
);
console.log('Changed date input to type="text"');

// 3. Clean up empty lines left behind from username removal
c = c.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(p, c, 'utf8');

// Verify
const final = fs.readFileSync(p, 'utf8');
console.log('Tên đăng nhật remaining:', (final.match(/Tên đăng nhập/g) || []).length, '(should be 0)');
console.log('formUsername remaining:', (final.match(/formUsername/g) || []).length, '(should be 0)');
console.log('type="date" remaining:', (final.match(/type="date"/g) || []).length, '(should be 0)');
console.log('type="text" for dob:', final.includes('type="text" value={formDob}'), '(should be true)');
console.log('Done!');

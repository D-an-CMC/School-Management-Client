import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// The JSX block is on ONE LINE: <div> <label>...</label> <input ... /> </div>
// Find and remove it
const lineStart = ' <label className="block text-xs font-semibold text-gray-700 mb-1">Tên đăng nhập</label>';
const lineInput = ' <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" placeholder="Tên đăng nhập" />';

const idx1 = c.indexOf(lineStart);
console.log('Label found at:', idx1);
console.log('Context:', JSON.stringify(c.substring(idx1-20, idx1+50)));

if (idx1 >= 0) {
  // Find the line start (previous newline + space)
  const realStart = c.lastIndexOf('\n', idx1) + 1;
  // Find the end of this line (next newline after the input)
  const idx2 = c.indexOf(lineInput, idx1);
  const inputEnd = idx2 + lineInput.length;
  const realEnd = c.indexOf('\n', inputEnd) + 1;

  console.log('Removing from', realStart, 'to', realEnd);
  console.log('Content to remove:', JSON.stringify(c.substring(realStart, realEnd)));

  c = c.substring(0, realStart) + c.substring(realEnd);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Removed!');
}

const final = fs.readFileSync(p, 'utf8');
console.log('Remaining Tên đăng nhập:', (final.match(/Tên đăng nhập/g)||[]).length);
console.log('Remaining formUsername:', (final.match(/formUsername/g)||[]).length);
console.log('Done!');

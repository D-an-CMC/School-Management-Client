import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Find and replace lines 493-499: the Ngày Tháng Năm Sinh block
// Current structure has extra <div> nesting, we need to replace from the <div> before the label to the closing </div>

const labelLine = ' <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Tháng Năm Sinh</label>';
const idx = c.indexOf(labelLine);
console.log('Label at:', idx);
if (idx >= 0) {
  // Find the opening <div> before the label
  const divOpen = c.lastIndexOf('<div>', idx);
  // Find the closing </div> after the input (should be around 2-3 lines after)
  const afterInput = c.indexOf('/>', idx) + 2;
  const divClose = c.indexOf('</div>', afterInput);
  const divCloseEnd = divClose + '</div>'.length;

  console.log('Replacing from', divOpen, 'to', divCloseEnd);
  const oldBlock = c.substring(divOpen, divCloseEnd);
  console.log('Old block:', oldBlock.substring(0, 200));

  const newBlock = ` <div>
  <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Tháng Năm Sinh</label>
  <div className="relative">
    <input
      type="text"
      value={(() => { if (!formDob) return ''; const parts = formDob.split('-'); return parts[2] + '/' + parts[1] + '/' + parts[0]; })()}
      onChange={(e) => { const raw = e.target.value; const m = raw.match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/); if (m) setFormDob(m[3] + '-' + m[2] + '-' + m[1]); else if (!raw) setFormDob(''); }}
      placeholder="dd/mm/yyyy"
      className="w-full border border-gray-300 rounded-lg px-3 pr-10 py-2 text-sm text-gray-900"
    />
    <button
      type="button"
      onClick={() => { const el = document.getElementById('dob-date-picker') as HTMLInputElement | null; if (el) el.showPicker?.(); else el?.click(); }}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-lg leading-none"
      tabIndex={-1}
    >
      📅
    </button>
    <input
      id="dob-date-picker"
      type="date"
      value={formDob}
      onChange={(e) => { const v = e.target.value; if (v) { const p = v.split('-'); setFormDob(p[2] + '/' + p[1] + '/' + p[0]); } else setFormDob(''); }}
      className="sr-only"
    />
  </div>
</div>`;

  c = c.substring(0, divOpen) + newBlock + c.substring(divCloseEnd + 1); // +1 to skip extra newline
  fs.writeFileSync(p, c, 'utf8');
  console.log('Replaced!');
}

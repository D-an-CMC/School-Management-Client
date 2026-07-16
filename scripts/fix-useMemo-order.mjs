import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// The original code (before my edits) used pageItems from allUsers and filtered from useMemo
// The correct approach: useMemo computes filtered, then we derive totalPages/safePage/filteredPageItems from it
// totalItems is not needed at all - the footer uses filtered.length

// Replace lines 91-112 with the correctly ordered computation
const oldText = c.split('\n').slice(90, 113).join('\n');
console.log('Current lines 91-112:');
console.log(oldText);
console.log('---');

const replacementLines = [
' const filtered = useMemo(() => {',
'  let result = allUsers',
'  if (roleFilter) {',
'    result = result.filter((u) => (u.role_name || \'\') === roleFilter)',
'  }',
'  if (search) {',
'    const q = search.toLowerCase()',
'    result = result.filter(',
'      (u) =>',
'        (u.username || u.full_name || \'\').toLowerCase().includes(q) ||',
'        u.email.toLowerCase().includes(q)',
'    )',
'  }',
'  return result',
' }, [search, allUsers, roleFilter])',
'',
' const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))',
' const safePage = Math.min(page, totalPages)',
' const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)',
];

const lines = c.split('\n');
const before = lines.slice(0, 90).join('\n');
const after = lines.slice(112).join('\n'); // keep line 112 onwards (pageItems removed)
const result = before + '\n' + replacementLines.join('\n') + '\n' + after;
fs.writeFileSync(p, result, 'utf8');
console.log('Done! Reordered: filtered (useMemo) -> totalPages -> safePage -> filteredPageItems');
console.log('Removed: pageItems (unused), totalItems (unused)');

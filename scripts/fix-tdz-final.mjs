import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// The problem: totalPages uses filtered.length but filtered is defined AFTER totalPages
// Fix: compute filteredPageItems AFTER safePage is computed by rearranging

// Strategy: move filtered to BEFORE totalPages, but filteredPageItems stays after safePage
const newContent = ` const filtered = useMemo(() => {
  let result = allUsers
  if (roleFilter) {
    result = result.filter((u) => (u.role_name || '') === roleFilter)
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (u) =>
        (u.username || u.full_name || '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }
  return result
 }, [search, allUsers, roleFilter])

 const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
 const totalItems = allUsers.length
 const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
 const safePage = Math.min(page, totalPages)
 const pageItems = allUsers.slice((safePage - 1) * pageSize, safePage * pageSize)`;

// Wait - filteredPageItems uses safePage which still needs totalPages!
// The REAL fix: filteredPageItems should be computed AFTER safePage
// But we need to remove safePage from being used before totalPages

// Correct fix:
const correctBlock = ` const filtered = useMemo(() => {
  let result = allUsers
  if (roleFilter) {
    result = result.filter((u) => (u.role_name || '') === roleFilter)
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (u) =>
        (u.username || u.full_name || '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }
  return result
 }, [search, allUsers, roleFilter])

 const totalItems = allUsers.length
 const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
 const safePage = Math.min(page, totalPages)
 const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
 const pageItems = allUsers.slice((safePage - 1) * pageSize, safePage * pageSize)`;

// Now match against the actual 4-line prefix (lines 91-94) followed by filtered block (lines 96-111 final old line)
const oldText = c.substring(90, 113); // lines 91-112 (0-indexed: 90-112)
console.log('Old text (lines 91-112):');
console.log(oldText);
console.log('---');

const testReplace = c.replace(
  /const totalItems = allUsers\.length\nconst totalPages = Math\.max\(1, Math\.ceil\(filtered\.length \/ pageSize\)\)\nconst safePage = Math\.min\(page, totalPages\)\nconst pageItems = allUsers\.slice\(\(safePage - 1\) \* pageSize, safePage \* pageSize\)\n\nconst filtered = useMemo\(\(\) => \{\n  let result = allUsers\n  if \(roleFilter\) \{\n    result = result\.filter\(\(u\) => \(u\.role_name \|\| ''\) === roleFilter\)\n  \}\n  if \(search\) \{\n    const q = search\.toLowerCase\(\)\n    result = result\.filter\(\n      \(u\) =>\n        \(u\.username \|\| u\.full_name \|\| ''\)\.toLowerCase\(\)\.includes\(q\) \|\|\n        u\.email\.toLowerCase\(\)\.includes\(q\)\n    \)\n  \}\n  return result\n\}, \[search, allUsers, roleFilter\]\)\n\nconst filteredPageItems = filtered\.slice\(\(safePage - 1\) \* pageSize, safePage \* pageSize\)/,
  correctBlock
);

if (testReplace !== c) {
  fs.writeFileSync(p, testReplace, 'utf8');
  console.log('SUCCESS: Fixed TDZ - filtered is now defined before totalPages');
} else {
  console.log('Regex did not match, trying line-by-line approach');
  const lines = c.split('\n');
  // Replace lines 91-112 (0-indexed 90-112) with the correct block
  const replacement = correctBlock.split('\n').map(l => l === '' ? '' : ' ' + l).join('\n');
  const before = lines.slice(0, 90).join('\n');
  const after = lines.slice(113).join('\n');
  const fixed = before + '\n' + correctBlock + '\n' + after;
  fs.writeFileSync(p, fixed, 'utf8');
  console.log('SUCCESS: Fixed via line-based approach');
}

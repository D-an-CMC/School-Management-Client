import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Replace the entire circular dependency block with a simple sequential computation
const oldBlock = `const filtered = useMemo(() => {
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

const newBlock = `const filtered = (() => {
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
})()

const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
const safePage = Math.min(page, totalPages)
const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)`;

c = c.replace(oldBlock, newBlock);

if (c.includes(oldBlock)) {
 console.log('ERROR: block not replaced');
} else {
 console.log('SUCCESS: Fixed circular dependency - filtered computed before totalPages/safePage');
 fs.writeFileSync(p, c, 'utf8');
}

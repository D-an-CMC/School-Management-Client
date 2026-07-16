import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Move filtered and filteredPageItems BEFORE totalPages/safePage/pageItems
// Current order (lines 91-112):
//   totalItems = allUsers.length
//   totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))  <-- uses filtered before it exists!
//   safePage = ...
//   pageItems = ...
//   filtered = useMemo(...)
//   filteredPageItems = ...

// Block 1: move this BEFORE totalPages
const filteredBlock = `const filtered = useMemo(() => {
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

 const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)`;

// Block 2: current prefix (before filtered)
const prefixBlock = `const totalItems = allUsers.length
const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)))
const pageItems = allUsers.slice((safePage - 1) * pageSize, safePage * pageSize)`;

// Replace the entire section
const oldSection = `const totalItems = allUsers.length
const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
const safePage = Math.min(page, totalPages)
const pageItems = allUsers.slice((safePage - 1) * pageSize, safePage * pageSize)

const filtered = useMemo(() => {
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

const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)`;

// New order: filtered first (but it needs safePage which needs totalPages...)
// Actually, the simplest fix: just use allUsers.length for totalPages (the pre-filter count)
// and use filtered.slice for pageItems

// Better approach: just fix totalPages to use allUsers.length and keep filtered for slicing
const newSection = `const filtered = useMemo(() => {
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

c = c.replace(oldSection, newSection);

if (c.includes(oldSection)) {
 console.log('ERROR: old section still present');
} else {
 console.log('SUCCESS: Reordered variables - filtered now defined before use');
 fs.writeFileSync(p, c, 'utf8');
}

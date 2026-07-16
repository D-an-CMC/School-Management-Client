import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Replace conditional Promise.all with unconditional fetch
c = c.replace(
`async function loadUsers() {
 setLoading(true)
 const promises = []
 if (!roleFilter || roleFilter === 'Admin') {
 promises.push(getUsers({ page: 1, limit: 500 }).then(r => ({ type: 'users', data: r })))
 }
 if (!roleFilter || roleFilter === 'HocSinh-PhuHuynh') {
 promises.push(getStudents({ page: 1, limit: 500 }).then(r => ({ type: 'students', data: r })))
 }
 if (!roleFilter || roleFilter === 'GiaoVien') {
 promises.push(getTeachers({ page: 1, limit: 500 }).then(r => ({ type: 'teachers', data: r })))
 }
 const results = await Promise.all(promises)
 const uRes = results.find(r => r.type === 'users') || { data: { data: [] } }
 const sRes = results.find(r => r.type === 'students') || { data: { data: [] } }
 const tRes = results.find(r => r.type === 'teachers') || { data: { data: [] } }`,
`async function loadUsers() {
 setLoading(true)
 const [uRes, sRes, tRes] = await Promise.all([
 getUsers({ page: 1, limit: 500 }),
 getStudents({ page: 1, limit: 500 }),
 getTeachers({ page: 1, limit: 500 }),
 ])`
);

// 2. Simplify filtered useMemo - remove slicing, return full filtered list
c = c.replace(
`const filtered = useMemo(() => {
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
 return result.slice((safePage - 1) * pageSize, safePage * pageSize)
 }, [search, allUsers, roleFilter, safePage, pageSize])`,
`const filtered = useMemo(() => {
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
 }, [search, allUsers, roleFilter])`
);

// 3. Add filteredPageItems after filtered
c = c.replace(
`const filtered = useMemo(() => {
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
 }, [search, allUsers, roleFilter])`,
`const filtered = useMemo(() => {
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

 const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)`
);

// 4. Update totalPages to use filtered.length instead of totalItems
c = c.replace(
'const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))',
'const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))'
);

// 5. Replace filtered.map with filteredPageItems.map
c = c.replace(
'{filtered.map((u) => (',
'{filteredPageItems.map((u) => ('
);

// 6. Replace "Loc" button with role filter buttons
const filterButtons = `<div className="flex items-center gap-1">
<button
 onClick={() => toggleRoleFilter('')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === '' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Tat ca</button>
<button
 onClick={() => toggleRoleFilter('HocSinh-PhuHuynh')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'HocSinh-PhuHuynh' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Hoc sinh</button>
<button
 onClick={() => toggleRoleFilter('GiaoVien')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'GiaoVien' ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Giao vien</button>
<button
 onClick={() => toggleRoleFilter('Admin')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'Admin' ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Quan tri</button>
</div>`;

c = c.replace(
`<button className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm">
 &#128274; Loc
 </button>`,
filterButtons
);

fs.writeFileSync(p, c, 'utf8');
console.log('Done applying fixes');

const f = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let content = require('fs').readFileSync(f, 'utf8');

// 1. Add page state after search state
content = content.replace(
  "const [search, setSearch] = useState('')",
  "const [search, setSearch] = useState('')\n  const [page, setPage] = useState(1)\n  const pageSize = 10"
);

// 2. Reload when page changes
content = content.replace(
  "useEffect(() => {\n  loadUsers()\n}, [])",
  "useEffect(() => {\n  loadUsers()\n}, [page])"
);

// 3. Use larger limit so we have all data client-side
content = content.replace(
  "getUsers({ page: 1, limit: 200 }),\n    getStudents({ page: 1, limit: 200 }),\n    getTeachers({ page: 1, limit: 200 })",
  "getUsers({ page: 1, limit: 500 }),\n    getStudents({ page: 1, limit: 500 }),\n    getTeachers({ page: 1, limit: 500 })"
);

// 4. Add pagination slice after setUsers
content = content.replace(
  "const all = [...studentRows, ...teacherRows, ...userRows]\nsetUsers(all)\nsetLoading(false)",
  "const all = [...studentRows, ...teacherRows, ...userRows]\nconst totalItems = all.length\nconst totalPages = Math.max(1, Math.ceil(totalItems / pageSize))\nconst safePage = Math.min(page, totalPages)\nconst pageItems = all.slice((safePage - 1) * pageSize, safePage * pageSize)\nsetUsers(pageItems)\nsetPage(safePage)\nsetLoading(false)"
);

// 5. Filter uses all (not users) so search works on full dataset
content = content.replace(
  "const filtered = search\n  ? users.filter(\n    (u) =>\n    (u.username || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||\n    u.email.toLowerCase().includes(search.toLowerCase())\n  )\n: users",
  "const filtered = search\n  ? all.filter(\n    (u) =>\n    (u.username || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||\n    u.email.toLowerCase().includes(search.toLowerCase())\n  )\n: pageItems"
);

// 6. Remove slice in map and info line - use filtered directly
content = content.replace(
  "{filtered.slice(0, 20).map((u) => (",
  "{filtered.map((u) => ("
);

// 7. Replace the bottom info + add pagination controls
content = content.replace(
  '<div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs md:text-sm text-gray-900">\n<div>\nHiển thị {filtered.slice(0, 20).length} / {filtered.length} người dùng\n</div>\n</div>',
  '<div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs md:text-sm text-gray-900">\n<div>\nHiển thị {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} / {filtered.length} người dùng\n</div>\n<div className="flex items-center gap-1">\n<button\n  onClick={() => setPage(p => Math.max(1, p - 1))}\n  disabled={safePage <= 1}\n  className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm"\n>Trước</button>\n{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (\n  <button\n    key={p}\n    onClick={() => setPage(p)}\n    className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (p === safePage ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50")}\n  >\n    {p}\n  </button>\n))}\n<button\n  onClick={() => setPage(p => Math.min(totalPages, p + 1))}\n  disabled={safePage >= totalPages}\n  className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm"\n>Sau</button>\n</div>\n</div>'
);

require('fs').writeFileSync(f, content);
console.log('done');
process.exit(0);

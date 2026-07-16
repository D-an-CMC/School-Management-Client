import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Find the getClasses useEffect end and inject click-outside handler after it
const marker = '}, [])';
const afterGetClasses = c.indexOf(marker, c.indexOf('getClasses'));

// Find the position right before "async function loadUsers()"
const loadUsersIdx = c.indexOf('async function loadUsers()');

// Insert click-outside useEffect between them
const clickOutsideCode = `
useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
   if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
     setShowFilter(false)
   }
 }
 document.addEventListener('mousedown', handleClickOutside)
 return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])`;

// Insert right before "async function loadUsers()"
c = c.substring(0, loadUsersIdx) + clickOutsideCode + '\n\nasync function loadUsers() {\n' + c.substring(loadUsersIdx + 'async function loadUsers() {'.length - 1);

fs.writeFileSync(p, c, 'utf8');
console.log('Done: Added click-outside handler');

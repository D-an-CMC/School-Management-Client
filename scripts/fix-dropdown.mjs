import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add filterRef to state declarations
c = c.replace(
`const [classOptions, setClassOptions] = useState<{ class_id: number; class_name: string; grade_level: number }[]>([])`,
`const filterRef = useRef<HTMLDivElement>(null)
const [classOptions, setClassOptions] = useState<{ class_id: number; class_name: string; grade_level: number }[]>([])`
);

// 2. Add click-outside useEffect after the getClasses useEffect
const getClassesEffect = `useEffect(() => {
 getClasses().then(r => {
 const list = (r.data || []).map((c: any) => ({ class_id: c.class_id, class_name: c.class_name, grade_level: c.grade_level }))
 setClassOptions(list)
 })
}, [])`;

const clickOutsideEffect = `useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
 setShowFilter(false)
 }
 }
 document.addEventListener('mousedown', handleClickOutside)
 return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])`;

c = c.replace(getClassesEffect, getClassesEffect + '\n\n' + clickOutsideEffect);

// 3. Change dropdown position from left-0 to right-0
c = c.replace(
`className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-[320px]"`,
`className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-[320px]"`
);

// 4. Add ref to the filter div wrapper
c = c.replace(
`<div className="relative">`,
`<div className="relative" ref={filterRef}>`
);

fs.writeFileSync(p, c, 'utf8');
console.log('Done: click-outside + right-aligned dropdown');

import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Find the unique button by its className (the Loc button)
const oldBtnClass = 'className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm">';
const idx = c.indexOf(oldBtnClass);
console.log('Found at index:', idx);
console.log('After class attr:', JSON.stringify(c.substring(idx + oldBtnClass.length, idx + oldBtnClass.length + 40)));

// Replace the whole button + following add button div structure
// Strategy: replace the 2-button section (Loc + Them) with search + role filters + Them
const sectionStart = c.indexOf('</div>\n<button className="px-3 md:px-4 py-2 border border-gray-300');
const sectionEnd = c.indexOf('</button>\n</div>', sectionStart) + '</button>\n</div>'.length;
console.log('Section start:', sectionStart, 'end:', sectionEnd);
console.log('Section to replace:', JSON.stringify(c.substring(sectionStart, sectionEnd)));

const newSection = `</div>
<div className="flex items-center gap-1">
<button
 onClick={() => toggleRoleFilter('')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === '' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Tất cả</button>
<button
 onClick={() => toggleRoleFilter('HocSinh-PhuHuynh')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'HocSinh-PhuHuynh' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Học sinh</button>
<button
 onClick={() => toggleRoleFilter('GiaoVien')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'GiaoVien' ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Giáo viên</button>
<button
 onClick={() => toggleRoleFilter('Admin')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'Admin' ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Quản trị</button>
</div>
<div className="flex items-center gap-1">`;

// Actually, we want: search | filters | add button
// Let's see what comes BEFORE the Loc button
const flexRowStart = c.lastIndexOf('<div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6 lg:mb-8">', sectionStart);
console.log('Flex row start:', flexRowStart);

// Replace Loc button (and keep add button)
// Loc button: from its opening to right before the add button
const locBtnStart = c.indexOf('\n<button className="px-3 md:px-4 py-2 border border-gray-300"', flexRowStart);
const addBtnStart = c.indexOf('Thêm người dùng', locBtnStart);
const addBtnEnd = c.indexOf('</button>', addBtnStart) + '</button>'.length;
console.log('Loc start:', locBtnStart, 'add btn:', addBtnStart, 'add btn end:', addBtnEnd);

const replacement = `<div className="flex items-center gap-1">
<button
 onClick={() => toggleRoleFilter('')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === '' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Tất cả</button>
<button
 onClick={() => toggleRoleFilter('HocSinh-PhuHuynh')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'HocSinh-PhuHuynh' ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Học sinh</button>
<button
 onClick={() => toggleRoleFilter('GiaoVien')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'GiaoVien' ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Giáo viên</button>
<button
 onClick={() => toggleRoleFilter('Admin')}
 className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (roleFilter === 'Admin' ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
>Quản trị</button>
</div>`;

const locBtnEnd = addBtnStart; // right before "Thêm người dùng" button
const locFullBtn = c.substring(locBtnStart, locBtnEnd);
console.log('Loc button text:', JSON.stringify(locFullBtn));

if (locFullBtn.length > 10) {
 c = c.substring(0, locBtnStart) + replacement + c.substring(locBtnEnd);
 fs.writeFileSync(p, c, 'utf8');
 console.log('SUCCESS: Replaced Loc button with role filters');
} else {
 console.log('ERROR: Could not find Loc button to replace');
}

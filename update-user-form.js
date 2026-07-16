const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(app)/user-management/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add getStudentCodePreview to import
content = content.replace(
  "import { getUsers, getStudents, getTeachers, updateUser, getClasses, createUser } from '@/lib/api'",
  "import { getUsers, getStudents, getTeachers, updateUser, getClasses, createUser, getStudentCodePreview } from '@/lib/api'"
);

// 2. Add useEffect import
content = content.replace(
  "import { useEffect, useMemo, useRef, useState } from 'react'",
  "import { useEffect, useMemo, useRef, useState } from 'react'"
);

// 3. Remove previewCode useMemo block - find and replace it
const previewMemoRegex = /const previewCode = useMemo\(\(\) => \{[\s\S]*?\}, \[formRole, formFullName, formClassId, formStudentCode, formTeacherCode, classOptions\]\);/;
content = content.replace(previewMemoRegex, '');

// 4. Add the useEffect for auto-generating student code
content = content.replace(
  /const \[openMenuId, setOpenMenuId\] = useState<number \| null>\(null\)\n/,
  `const [openMenuId, setOpenMenuId] = useState<number | null>(null)

useEffect(() => {
  if (formRole !== 'HocSinh-PhuHuynh') return
  if (formClassId === '' || formClassId === 0) {
    setFormStudentCode('')
    return
  }
  setFormStudentCode('')
  getStudentCodePreview(formClassId).then(res => {
    if (res) {
      setFormStudentCode(res.student_code)
    }
  })
}, [formClassId, formRole])
`
);

// 5. Make student_code input readonly and remove placeholder for students
content = content.replace(
  `<label className="block text-xs font-semibold text-gray-700 mb-1">Mã học sinh</label>\n<input\n  type="text"\n  value={formStudentCode}\n  onChange={(e) => setFormStudentCode(e.target.value)}\n  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"\n  placeholder="7A1-01"\n/>`,
  `<label className="block text-xs font-semibold text-gray-700 mb-1">Mã học sinh</label>\n<input\n  type="text"\n  value={formStudentCode}\n  readOnly\n  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"\n/>`
);

// 6. Replace email field input - make it readonly for student role
// Email field - student role: readonly + gray bg
content = content.replace(
  `<label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">\\*</span></label>\n<input\n  type="email"\n  value={formEmail}\n  onChange={(e) => {\n    setFormEmail(e.target.value)\n    if (fieldErrors.email) setFieldErrors(prev => { const next = { ...prev }; delete next.email; return next })\n  }}\n  required\n  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"\n  placeholder="email@cmc.edu.vn"\n/>\n{fieldErrors.email && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.email}</p>}\n{previewCode && (\n  <div className="mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">\n    <span className="font-medium">Tu dong sinh: </span>{previewCode.code}: {previewCode.email}\n  </div>\n)}`,
  `<label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>\n<input\n  type="email"\n  value={formEmail}\n  onChange={(e) => {\n    setFormEmail(e.target.value)\n    if (fieldErrors.email) setFieldErrors(prev => { const next = { ...prev }; delete next.email; return next })\n  }}\n  required\n  readOnly={formRole === 'HocSinh-PhuHuynh'}\n  className={\`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 \${formRole === 'HocSinh-PhuHuynh' ? 'bg-gray-50' : ''}\`}\n  placeholder="email@cmc.edu.vn"\n/>\n{fieldErrors.email && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.email}</p>}\n{previewCode && formRole === 'HocSinh-PhuHuynh' && (\n  <div className="mt-1.5 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">\n    <span className="font-medium">Mã HS: </span>{previewCode.code} \\<br/>\n    <span className="font-medium">Email: </span>{previewCode.email}\n  </div>\n)}`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done! File updated successfully.');

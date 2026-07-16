const fs = require('fs');
const path = 'app/(app)/user-management/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Replace previewCode useMemo with simpler autoCalc
c = c.replace(
  /const previewCode[\s\S]*?classOptions\);[\s\S]*?const openAddModal/,
  `const [formGrade, setFormGrade] = useState<number | ''>('')
const [gradeOptions, setGradeOptions] = useState<number[]>([])
const [filteredClassOptions, setFilteredClassOptions] = useState<{ class_id: number; class_name: string; grade_level: number }[]>([])
const [displayEmail, setDisplayEmail] = useState('')
const [displayStudentCode, setDisplayStudentCode] = useState('')
const [displayTeacherCode, setDisplayTeacherCode] = useState('')

useEffect(() => {
  if (classOptions.length > 0) {
    const grades = [...new Set(classOptions.map(c => c.grade_level))].sort((a, b) => a - b)
    setGradeOptions(grades)
  }
}, [classOptions])

useEffect(() => {
  if (formGrade) {
    setFilteredClassOptions(classOptions.filter(c => c.grade_level === formGrade))
  } else {
    setFilteredClassOptions([])
  }
  setFormClassId('')
  setDisplayStudentCode('')
  setDisplayEmail('')
}, [formGrade, classOptions])

useEffect(() => {
  if (formRole === 'HocSinh-PhuHuynh' && formFullName && formClassId) {
    const cls = classOptions.find(c => c.class_id === formClassId)
    if (!cls) { setDisplayStudentCode(''); setDisplayEmail(''); return }
    const clsName = cls.class_name.replace(/\\s/g, '')
    const code = clsName + '-01'
    const slug = formFullName.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/\\.$/, '')
    setDisplayStudentCode(code)
    setDisplayEmail(slug + '.' + code + '@student.cmc.edu.vn')
  } else if (formRole === 'GiaoVien' && formFullName) {
    const slug = formFullName.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/\\.$/, '')
    const code = 'GV01'
    setDisplayTeacherCode(code)
    setDisplayEmail(slug + '.' + code.toLowerCase() + '@cmc.edu.vn')
  } else if (formRole === 'Admin') {
    setDisplayEmail(formFullName ? formFullName.toLowerCase().replace(/[^a-z0-9]+/g, '.') + '@cmc.edu.vn' : '')
    setDisplayStudentCode('')
    setDisplayTeacherCode('')
  } else {
    setDisplayEmail('')
    setDisplayStudentCode('')
    setDisplayTeacherCode('')
  }
}, [formRole, formFullName, formClassId, classOptions])

const openAddModal`
);

// 2. Update openAddModal to reset new fields
c = c.replace(
  'setFormStudentCode(\'\')\n setFormTeacherCode(\'\')',
  'setFormStudentCode(\'\')\n setFormTeacherCode(\'\')\n setFormGrade(\'\')\n setDisplayEmail(\'\')\n setDisplayStudentCode(\'\')\n setDisplayTeacherCode(\'\')\n setFilteredClassOptions([])\n setGradeOptions([])'
);

// 3. Update handleSubmit to use display values
c = c.replace(
  /body\.student_code = formStudentCode \|\| undefined/,
  "body.student_code = displayStudentCode || undefined"
);
c = c.replace(
  /student_code: s\.student_code/,
  'student_code: s.student_code\n body.teacher_code = displayTeacherCode || undefined'
);

// 4. Replace email input with read-only display
c = c.replace(
  `<div className="grid grid-cols-2 gap-3">\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">\*</span></label>\n <input\n type="email"\n value={formEmail}\n onChange=\{\(e\) => \{\n setFormEmail\(e\.target\.value\)\n if \(fieldErrors\.email\) setFieldErrors\(prev => \{ const next = \{ \.\.\.prev \}; delete next\.email; return next \}\)\n \}\}\n required\n className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"\n placeholder="email@cmc\.edu\.vn"\n />\n \{fieldErrors\.email && <p className="text-red-500 text-xs mt-0\.5">\{fieldErrors\.email\}</p>\}\n \{previewCode && \(\n <div className="mt-1\.5 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">\n <span className="font-medium">Tu dong sinh: </span>\{previewCode\.code\}: \{previewCode\.email\}\n </div>\n \)\}\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">\*</span></label>`,
  `<div>\n <div className="flex justify-between items-center mb-1">\n <label className="block text-xs font-semibold text-gray-700">Email</label>\n \{displayEmail && <span className="text-[10px] text-blue-500 font-medium">Tự động sinh</span>\}\n </div>\n <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 min-h-[38px] flex items-center">\n \{displayEmail || <span className="text-gray-400">Chọn thông tin để tự sinh...</span>\}\n </div>\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">\*</span></label>`
);

// 5. Replace student class section with grade + class cascade
c = c.replace(
  `\{formRole === 'HocSinh-PhuHuynh' && \(\n <div className="grid grid-cols-2 gap-3">\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Lop</label>\n <select value=\{formClassId\} onChange=\{\(e\) => setFormClassId\(e\.target\.value \? Number\(e\.target\.value\) : ''\)\} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">\n <option value="">-- Chọn lop --</option>\n \{classOptions\.map\(\(c: any\) => \(\n <option key=\{c\.class_id\} value=\{c\.class_id\}>\{c\.class_name\} \(Khối \{c\.grade_level\}\)</option>\n \)\)\}\n </select>\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Mã học sinh</label>\n <input\n type="text"\n value=\{formStudentCode\}\n onChange=\{\(e\) => setFormStudentCode\(e\.target\.value\)\}\n className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"\n placeholder="7A1-01"\n />\n </div>\n </div>\n \)}\n \{formRole === 'GiaoVien' && \(`,
  `\{formRole === 'HocSinh-PhuHuynh' && \(\n <div className="grid grid-cols-2 gap-3">\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Khối</label>\n <select value=\{formGrade\} onChange=\{\(e\) => setFormGrade\(e\.target\.value \? Number\(e\.target\.value\) : ''\)\} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">\n <option value="">-- Chọn khối --</option>\n \{gradeOptions\.map\(g => \(\n <option key=\{g\} value=\{g\}>Khối \{g\}</option>\n \)\)\}\n </select>\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Lớp</label>\n <select value=\{formClassId\} onChange=\{\(e\) => setFormClassId\(e\.target\.value \? Number\(e\.target\.value\) : ''\)\} disabled=\{!formGrade\} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed">\n <option value="">-- \{formGrade ? 'Chọn lớp' : 'Chọn khối trước'\} --</option>\n \{filteredClassOptions\.map\(\(c: any\) => \(\n <option key=\{c\.class_id\} value=\{c\.class_id\}>\{c\.class_name\}</option>\n \)\)\}\n </select>\n </div>\n </div>\n \)}\n \{formRole === 'HocSinh-PhuHuynh' && \(\n <div className="grid grid-cols-2 gap-3">\n <div>\n <div className="flex justify-between items-center mb-1">\n <label className="block text-xs font-semibold text-gray-700">Mã học sinh</label>\n \{displayStudentCode && <span className="text-[10px] text-blue-500 font-medium">Tự động sinh</span>\}\n </div>\n <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 min-h-[38px] flex items-center">\n \{displayStudentCode || <span className="text-gray-400">Chọn lớp để sinh mã...</span>\}\n </div>\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Giới tính</label>\n <select value=\{formGender\} onChange=\{\(e\) => setFormGender\(e\.target\.value\)\} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">\n <option value="">-- Chọn --</option>\n <option value="Nam">Nam</option>\n <option value="Nữ">Nữ</option>\n <option value="Khác">Khác</option>\n </select>\n </div>\n </div>\n \)}\n \{formRole === 'GiaoVien' && \(`
);

// 6. Replace teacher code section with read-only
c = c.replace(
  `\{formRole === 'GiaoVien' && \(\n <div className="grid grid-cols-2 gap-3">\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Mã giáo viên</label>\n <input\n type="text"\n value=\{formTeacherCode\}\n onChange=\{\(e\) => setFormTeacherCode\(e\.target\.value\)\}\n className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"\n placeholder="GV001"\n />\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Bộ môn</label>\n <input`,
  `\{formRole === 'GiaoVien' && \(\n <div className="grid grid-cols-2 gap-3">\n <div>\n <div className="flex justify-between items-center mb-1">\n <label className="block text-xs font-semibold text-gray-700">Mã giáo viên</label>\n \{displayTeacherCode && <span className="text-[10px] text-blue-500 font-medium">Tự động sinh</span>\}\n </div>\n <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 min-h-[38px] flex items-center">\n \{displayTeacherCode || <span className="text-gray-400">Nhập họ tên để sinh mã...</span>\}\n </div>\n </div>\n <div>\n <label className="block text-xs font-semibold text-gray-700 mb-1">Bộ môn</label>\n <input`
);

fs.writeFileSync(path, c, 'utf8');
console.log('DONE - form rewritten');

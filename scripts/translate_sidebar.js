const fs = require('fs');
const filePath = 'c:/Users/phucn/Desktop/project/School-Management-Client/components/layout/sidebar.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Import useSettings
if (!content.includes("import { useSettings }")) {
  content = content.replace("import { logoutApi } from '@/lib/api'", "import { logoutApi } from '@/lib/api'\nimport { useSettings } from '@/lib/settings-context'");
}

// Add t function to Sidebar component
if (!content.includes("const { t } = useSettings()")) {
  content = content.replace("const { user } = useAuth()", "const { user } = useAuth()\n  const { t } = useSettings()");
}

// Replace Admin nav items labels
content = content.replace("label: 'Tổng quan'", "label: t('sidebar.dashboard')");
content = content.replace("label: 'Quản lý người dùng'", "label: t('sidebar.user_management')");
content = content.replace("label: 'Quản lý quyền hệ thống'", "label: t('sidebar.system_permissions')");
content = content.replace("label: 'Quản lý Thời khóa biểu'", "label: t('sidebar.admin_timetable')");
content = content.replace("label: 'Quản lý lớp'", "label: t('sidebar.class_management')");
content = content.replace("label: 'Quản lý điểm'", "label: t('sidebar.grade_management')");
content = content.replace("label: 'Chuyển năm học'", "label: t('sidebar.year_transition')");
content = content.replace("label: 'Xét kết quả cuối năm'", "label: t('sidebar.year_result')");
content = content.replace("label: 'Nhật ký bảo mật'", "label: t('sidebar.security_logs')");

// Replace Teacher nav items labels
content = content.replace("label: 'Lớp học phụ trách'", "label: t('sidebar.my_classes_teacher')");
content = content.replace("label: 'Sổ điểm học thuật'", "label: t('sidebar.gradebook_teacher')");
content = content.replace("label: 'Điểm danh'", "label: t('sidebar.attendance')");
content = content.replace("label: 'Thời khóa biểu'", "label: t('sidebar.timetable')");

// Replace Student nav items labels
content = content.replace("label: 'Lớp học của tôi'", "label: t('sidebar.my_classes_student')");
content = content.replace("label: 'Kết Quả học tập'", "label: t('sidebar.gradebook_student')");

// Replace Settings and Logout buttons
content = content.replace("<span>Cài đặt</span>", "<span>{t('sidebar.settings')}</span>");
content = content.replace("<span>Đăng xuất</span>", "<span>{t('sidebar.logout')}</span>");

fs.writeFileSync(filePath, content);
console.log('Sidebar translated');

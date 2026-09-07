const fs = require('fs');
const path = require('path');

const clientDir = 'c:/Users/phucn/Desktop/project/School-Management-Client';

// 1. Remove settings page
const settingsPage = path.join(clientDir, 'app/(app)/settings/page.tsx');
if (fs.existsSync(settingsPage)) fs.rmSync(settingsPage);
const settingsDir = path.join(clientDir, 'app/(app)/settings');
if (fs.existsSync(settingsDir)) fs.rmdirSync(settingsDir);

// 2. Remove settings-context and locales
const settingsContext = path.join(clientDir, 'lib/settings-context.tsx');
if (fs.existsSync(settingsContext)) fs.rmSync(settingsContext);
const localesDir = path.join(clientDir, 'lib/locales');
if (fs.existsSync(localesDir)) fs.rmSync(localesDir, { recursive: true, force: true });

// 3. Revert globals.css
const globalsCss = path.join(clientDir, 'app/globals.css');
if (fs.existsSync(globalsCss)) {
  let css = fs.readFileSync(globalsCss, 'utf8');
  css = css.replace(/\/\* Dark Mode Theme Variable Overrides \*\/[\s\S]*?\}\n/, '');
  fs.writeFileSync(globalsCss, css);
}

// 4. Revert app/(app)/layout.tsx
const layoutPath = path.join(clientDir, 'app/(app)/layout.tsx');
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  layout = layout.replace(/import { SettingsProvider } from '@\/lib\/settings-context'\n/, '');
  layout = layout.replace(/<SettingsProvider>\n\s*/g, '');
  layout = layout.replace(/\s*<\/SettingsProvider>\n/g, '\n');
  layout = layout.replace(/ bg-background dark:bg-gray-900 transition-colors duration-200/g, ' bg-background');
  layout = layout.replace(/ bg-gray-50 dark:bg-gray-900 transition-colors duration-200/g, ' bg-gray-50');
  fs.writeFileSync(layoutPath, layout);
}

// 5. Revert header.tsx
const headerPath = path.join(clientDir, 'components/layout/header.tsx');
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');
  header = header.replace(/import { useSettings } from '@\/lib\/settings-context'\n/, '');
  header = header.replace(/const { t } = useSettings\(\)\n  /, '');
  header = header.replace(/placeholder={showMenuButton \? t\('header\.search_placeholder'\) : t\('header\.search_logs_placeholder'\)}/, "placeholder={showMenuButton ? 'Tìm kiếm...' : 'Tìm kiếm nhật ký...'}");
  header = header.replace(/\|\| t\('header\.default_user'\)/, "|| 'Người dùng'");
  header = header.replace(/dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/g, 'border-b border-gray-200');
  fs.writeFileSync(headerPath, header);
}

// 6. Revert teacher-dashboard.tsx
const teacherDashboardPath = path.join(clientDir, 'components/dashboard/teacher-dashboard.tsx');
if (fs.existsSync(teacherDashboardPath)) {
  let td = fs.readFileSync(teacherDashboardPath, 'utf8');
  td = td.replace(/import { useSettings } from '@\/lib\/settings-context'\n/, '');
  td = td.replace(/const { t } = useSettings\(\)\n  /, '');
  td = td.replace(/\{t\('dashboard\.hello'\)\}, \{user\?\.name\} \| \{t\('dashboard\.teacher'\)\}/, "Xin chào, {user?.name} | Giáo viên");
  td = td.replace(/\{t\('dashboard\.welcome'\)\}/, "Chào mừng bạn trở lại hệ thống quản lý học tập.");
  td = td.replace(/\{t\('dashboard\.stats\.classes'\)\}/, "Lớp học phụ trách");
  td = td.replace(/\{t\('dashboard\.stats\.students'\)\}/, "Tổng học sinh");
  td = td.replace(/\{t\('dashboard\.stats\.attendance'\)\}/, "Buổi điểm danh");
  td = td.replace(/\{t\('dashboard\.timetable\.title'\)\}/, "Lịch dạy hôm nay");
  td = td.replace(/\{t\('dashboard\.timetable\.no_classes'\)\}/, "Không có lịch dạy hôm nay.");
  td = td.replace(/\{t\('dashboard\.recent_attendance\.title'\)\}/, "Điểm danh gần đây");
  td = td.replace(/\{t\('dashboard\.recent_attendance\.no_records'\)\}/, "Chưa có dữ liệu.");
  td = td.replace(/ bg-white dark:bg-gray-900 transition-colors duration-200"/g, ' bg-white"');
  td = td.replace(/ dark:text-white/g, '');
  td = td.replace(/ dark:text-gray-400/g, '');
  td = td.replace(/ dark:text-gray-300/g, '');
  td = td.replace(/ dark:bg-gray-800/g, '');
  td = td.replace(/ dark:border-gray-700/g, '');
  fs.writeFileSync(teacherDashboardPath, td);
}

// 7. Revert sidebar.tsx
const sidebarPath = path.join(clientDir, 'components/layout/sidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let sb = fs.readFileSync(sidebarPath, 'utf8');
  sb = sb.replace(/import { useSettings } from '@\/lib\/settings-context'\n/, '');
  sb = sb.replace(/const { t } = useSettings\(\)\n  /, '');
  
  sb = sb.replace(/label: t\('sidebar\.dashboard'\)/g, "label: 'Tổng quan'");
  sb = sb.replace(/label: t\('sidebar\.user_management'\)/g, "label: 'Quản lý người dùng'");
  sb = sb.replace(/label: t\('sidebar\.system_permissions'\)/g, "label: 'Quản lý quyền hệ thống'");
  sb = sb.replace(/label: t\('sidebar\.admin_timetable'\)/g, "label: 'Quản lý Thời khóa biểu'");
  sb = sb.replace(/label: t\('sidebar\.class_management'\)/g, "label: 'Quản lý lớp'");
  sb = sb.replace(/label: t\('sidebar\.grade_management'\)/g, "label: 'Quản lý điểm'");
  sb = sb.replace(/label: t\('sidebar\.year_transition'\)/g, "label: 'Chuyển năm học'");
  sb = sb.replace(/label: t\('sidebar\.year_result'\)/g, "label: 'Xét kết quả cuối năm'");
  sb = sb.replace(/label: t\('sidebar\.security_logs'\)/g, "label: 'Nhật ký bảo mật'");
  
  sb = sb.replace(/label: t\('sidebar\.my_classes_teacher'\)/g, "label: 'Lớp học phụ trách'");
  sb = sb.replace(/label: t\('sidebar\.gradebook_teacher'\)/g, "label: 'Sổ điểm học thuật'");
  sb = sb.replace(/label: t\('sidebar\.attendance'\)/g, "label: 'Điểm danh'");
  sb = sb.replace(/label: t\('sidebar\.timetable'\)/g, "label: 'Thời khóa biểu'");
  
  sb = sb.replace(/label: t\('sidebar\.my_classes_student'\)/g, "label: 'Lớp học của tôi'");
  sb = sb.replace(/label: t\('sidebar\.gradebook_student'\)/g, "label: 'Kết Quả học tập'");
  
  // Note: the settings link button might still have the t('sidebar.settings')
  sb = sb.replace(/<span>\{t\('sidebar\.settings'\)\}<\/span>/g, "<span>Cài đặt</span>");
  sb = sb.replace(/<span>\{t\('sidebar\.logout'\)\}<\/span>/g, "<span>Đăng xuất</span>");
  
  fs.writeFileSync(sidebarPath, sb);
}

console.log('Revert applied');

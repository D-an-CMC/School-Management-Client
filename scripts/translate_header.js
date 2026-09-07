const fs = require('fs');

const viPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/lib/locales/vi.json';
const enPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/lib/locales/en.json';

const viDict = JSON.parse(fs.readFileSync(viPath, 'utf8'));
viDict.header = {
  search_placeholder: "Tìm kiếm...",
  search_logs_placeholder: "Tìm kiếm nhật ký...",
  default_user: "Người dùng"
};
fs.writeFileSync(viPath, JSON.stringify(viDict, null, 2));

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
enDict.header = {
  search_placeholder: "Search...",
  search_logs_placeholder: "Search logs...",
  default_user: "User"
};
fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2));

const headerPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/components/layout/header.tsx';
let headerContent = fs.readFileSync(headerPath, 'utf8');

headerContent = headerContent.replace("import { useAuth } from '@/lib/auth-context'", "import { useAuth } from '@/lib/auth-context'\nimport { useSettings } from '@/lib/settings-context'");
headerContent = headerContent.replace("const { user } = useAuth()", "const { user } = useAuth()\n  const { t } = useSettings()");
headerContent = headerContent.replace("placeholder={showMenuButton ? 'Tìm kiếm...' : 'Tìm kiếm nhật ký...'}", "placeholder={showMenuButton ? t('header.search_placeholder') : t('header.search_logs_placeholder')}");
headerContent = headerContent.replace("|| 'Người dùng'", "|| t('header.default_user')");
// To ensure it inherits the theme colors properly, we should remove hardcoded `bg-white` and `border-gray-200` if they look weird, but let's test CSS var overrides first.
headerContent = headerContent.replace('className="bg-white border-b border-gray-200', 'className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700');

fs.writeFileSync(headerPath, headerContent);
console.log('Header translated');

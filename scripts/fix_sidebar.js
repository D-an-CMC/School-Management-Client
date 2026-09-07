const fs = require('fs');
const filePath = 'c:/Users/phucn/Desktop/project/School-Management-Client/components/layout/sidebar.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the line where 'use client' starts again
let duplicatedIndex = -1;
for (let i = 120; i < lines.length; i++) {
  if (lines[i].includes("'use client'")) {
    duplicatedIndex = i;
    break;
  }
}

if (duplicatedIndex !== -1) {
  // Keep everything before the duplicated code
  const newLines = lines.slice(0, duplicatedIndex);
  
  // Add the closing tags for the nav items
  newLines.push(
    "              >",
    "                <path d={item.icon} />",
    "              </svg>",
    "              {!isIconOnly && <span>{item.label}</span>}",
    "            </Link>",
    "          )",
    "        })}",
    "      </nav>",
    "",
    "      <div className={cn('border-t border-[#004080]', isIconOnly ? 'p-2 space-y-1' : 'px-2 py-4 space-y-1')}>",
    "        <Link",
    "          href=\"/settings\"",
    "          onClick={handleLinkClick}",
    "          className={cn(",
    "            'flex items-center rounded-md text-[#A0B4C8] hover:bg-[#004080] hover:text-white transition-colors text-sm font-medium',",
    "            isIconOnly ? 'w-full justify-center px-2 py-3' : 'gap-3 px-4 py-3'",
    "          )}",
    "        >",
    "          <svg className=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">",
    "            <path d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z\" />",
    "            <path d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />",
    "          </svg>",
    "          {!isIconOnly && <span>Cài đặt</span>}",
    "        </Link>",
    "        ",
    "        <button",
    "          onClick={() => {",
    "            if (isDrawer && onClose) onClose();",
    "            logoutApi();",
    "            window.location.href = '/login';",
    "          }}",
    "          className={cn(",
    "            'w-full flex items-center rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium',",
    "            isIconOnly ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'",
    "          )}",
    "        >",
    "          <svg className=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">",
    "            <path d=\"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1\" />",
    "          </svg>",
    "          {!isIconOnly && <span>Đăng xuất</span>}",
    "        </button>",
    "      </div>",
    "    </aside>",
    "  )",
    "}"
  );
  
  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log('Fixed syntax error by replacing duplicated code');
} else {
  console.log('Duplicated string not found?');
}

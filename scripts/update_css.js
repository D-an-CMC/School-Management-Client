const fs = require('fs');

const cssPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/app/globals.css';
const cssToAdd = `
/* Dark Mode Theme Variable Overrides */
.dark {
  --color-background: #111827;
  --color-foreground: #f9fafb;
  --color-surface-container-lowest: #1f2937;
  --color-surface-container: #374151;
  --color-surface-bright: #1f2937;
  --color-surface-vibrant: #1f2937;
  --color-border: #4b5563;
  --color-outline: #9ca3af;
  
  --color-gray-50: #111827;
  --color-gray-100: #1f2937;
  --color-gray-200: #374151;
  --color-gray-300: #4b5563;
  --color-gray-400: #6b7280;
  --color-gray-500: #9ca3af;
  --color-gray-600: #d1d5db;
  --color-gray-700: #e5e7eb;
  --color-gray-800: #f3f4f6;
  --color-gray-900: #f9fafb;
  --color-white: #1f2937;
  --color-black: #f9fafb;
  
  --color-[#003366]: #0f172a; /* Darker blue for sidebar */
  --color-[#004080]: #1e293b;
  --color-[#0066CC]: #3b82f6;
  --color-[#0055aa]: #2563eb;
  
  --color-blue-50: #0f172a;
  --color-blue-100: #1e293b;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  
  --color-indigo-50: #1e1e2f;
  --color-purple-50: #2d1b2e;
}
`;

fs.appendFileSync(cssPath, cssToAdd);
console.log('Updated globals.css');

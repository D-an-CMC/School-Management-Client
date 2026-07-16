import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// The text is from the node -e output: "\n &#128274; Lọc\n</button>\n<button "
const searchStr = '\n 28274; Lọc\n </button>';
const idx = c.indexOf('\n 28274; Lọc\n </button>');
console.log('Search index:', idx);
console.log('Looking for:', JSON.stringify('\n 28274; LỌ̣c\n </button>'));
console.log('Found at:', c.indexOf('\n 28274; LỌ̣c\n </button>'));
console.log('Index of L:', c.indexOf('LỌ̣c'));
console.log('Context:', JSON.stringify(c.substring(c.indexOf('LỌ̣c') - 30, c.indexOf('LỌ̣c') + 30)));

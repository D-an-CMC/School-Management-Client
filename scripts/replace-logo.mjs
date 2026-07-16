import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Strategy: find line 209 and replace it entirely
const lines = c.split('\n');
console.log('Before - Line 209:', JSON.stringify(lines[208]));

// Replace using the building-block approach
const idx = c.indexOf('hasActiveFilter');
if (idx >= 0) {
  // Find what comes before on the same line
  const lineStart = c.lastIndexOf('\n', idx) + 1;
  const lineEnd = c.indexOf('\n', idx);
  const currentLine = c.substring(lineStart, lineEnd);
  console.log('Current line:', JSON.stringify(currentLine));
}

// Direct approach: substring out the button content between > and </button>
// Find: &#128274; L... {hasActiveFilter ? ...}
c = c.replace(/<img src="\/icon\.svg"/g, '__PLACEHOLDER__');

// Use exact substring match via char code - the lock emoji is stored as HTML entity
// Let's just replace the entire className + button text block
const oldClassName = 'className={"px-3 md:px-4 py-2 border rounded font-medium text-xs md:text-sm " + (hasActiveFilter ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-gray-50")}';
const newClassName = 'className="px-3 md:px-4 py-2 border border-gray-300 rounded font-medium text-xs md:text-sm text-gray-700 hover:bg-gray-50"';

// Find the actual position of hasActiveFilter className
const classNameIdx = c.indexOf("px-3 md:px-4 py-2 border rounded font-medium text-xs md:text-sm");
console.log('className found at:', classNameIdx);

// Replace hasActiveFilter styling
if (c.includes("(hasActiveFilter ?")) {
  c = c.replace(
    /\"px-3 md:px-4 py-2 border rounded font-medium text-xs md:text-sm \" \+ \(hasActiveFilter \? \"border-blue-500 text-blue-600 bg-blue-50\" : \"border-gray-300 text-gray-700 hover:bg-gray-50\"\)/,
    '"px-3 md:px-4 py-2 border border-gray-300 rounded font-medium text-xs md:text-sm text-gray-700 hover:bg-gray-50"'
  );
  console.log('Replaced className');
}

// Now replace the button inner text
// The button starts at ref=f7e79 equivalent line
const buttonStart = c.indexOf('&#128274;');
console.log('Lock emoji found at:', buttonStart);
if (buttonStart >= 0) {
  const buttonEnd = c.indexOf('</button>', buttonStart);
  console.log('</button> found at:', buttonEnd);
  if (buttonEnd >= 0) {
    // Replace whole button content between > and </button>
    const afterOpen = c.indexOf('>', buttonStart) + 1;
    const beforeClose = buttonEnd;
    const replacement = '<img src="/icon.svg" alt="CMC" className="w-5 h-5 inline-block mr-1" />';
    c = c.substring(0, afterOpen) + replacement + c.substring(beforeClose);
    fs.writeFileSync(p, c, 'utf8');
    console.log('Replaced button content!');
  }
}

console.log('Done');

import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Read lines 89-112 and replace with corrected version
const lines = c.split('\n');

// Output current state for debugging
console.log('Line 89:', JSON.stringify(lines[89]));
console.log('Line 90:', JSON.stringify(lines[90]));
console.log('Line 91:', JSON.stringify(lines[91]));
console.log('Line 92:', JSON.stringify(lines[92]));
console.log('Line 95:', JSON.stringify(lines[95]));
console.log('Line 96:', JSON.stringify(lines[96]));

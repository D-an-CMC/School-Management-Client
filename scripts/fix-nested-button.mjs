import fs from 'fs';
const p = 'C:/Users/phucn/Desktop/School-Management-Client/app/(app)/user-management/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Remove the outer <button> that wraps the role filter buttons
// Find: <button className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm">
// and its matching </button> before the "Them nguoi dung" button

const match = c.match(/(<button className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm">\n)(<div className="flex items-center gap-1">[\s\S]*?)(<\/button>\n)(<button className="px-3 md:px-4 py-2 bg-blue-600)/);

if (match) {
 console.log('Found outer button to remove');
 console.log('Match[1] (outer opener):', JSON.stringify(match[1]));
 console.log('Match[2] (filter buttons):', JSON.stringify(match[2]));
 console.log('Match[3] (outer closer):', JSON.stringify(match[3]));
 console.log('Match[4] (next button):', JSON.stringify(match[4]));

 // Replace: remove outer button opener and closer, keep filter buttons + next button
 const replacement = match[2] + '\n' + match[4];
 c = c.substring(0, match.index) + replacement + c.substring(match.index + match[0].length);
 fs.writeFileSync(p, c, 'utf8');
 console.log('SUCCESS: Removed nested button wrapper');
} else {
 console.log('Pattern not found - trying alternative');
 // Try finding just the outer button around the filter div
 const idx1 = c.indexOf('<button className="px-3 md:px-4 py-2 border border-gray-300');
 const idx2 = c.indexOf('</div>\n</button>\n<button className="px-3 md:px-4 py-2 bg-blue-600');
 console.log('idx1:', idx1, 'idx2:', idx2);
 if (idx1 >= 0 && idx2 >= 0) {
   const before = c.substring(0, idx1);
   const between = c.substring(idx1);
   // Find the closing > of the opening button tag
   const openEnd = between.indexOf('>\n') + 2;
   const after = c.substring(idx2);
   const newPart = between.substring(openEnd, idx2 - idx1 - after.length + openEnd);
   console.log('New part:', JSON.stringify(newPart.substring(0, 100)));
   const replacement = newPart;
   c = before + replacement + after;
   fs.writeFileSync(p, c, 'utf8');
   console.log('SUCCESS with alternative approach');
 }
}

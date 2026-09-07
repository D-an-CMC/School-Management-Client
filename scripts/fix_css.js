const fs = require('fs');

const cssPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/--color-\[#[a-fA-F0-9]+\]: #[a-fA-F0-9]+;.*\n/g, '');

fs.writeFileSync(cssPath, css);
console.log('Fixed invalid CSS variables');

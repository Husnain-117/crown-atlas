import fs from 'fs';
const p = 'src/app/discover/[city]/_components/CountyDiscoveryPage.tsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/\u2019/g, "'");
fs.writeFileSync(p, s);
console.log('Done');

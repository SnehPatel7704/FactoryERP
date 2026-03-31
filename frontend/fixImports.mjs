import fs from 'fs';
import path from 'path';

const dirs = ['master', 'sales', 'production', 'dispatch', 'dashboard'];
const basePages = '/Users/snehpatel/Sneh/Projects/Rajesh Mama/FeatheraFine/frontend/src/pages';

dirs.forEach(dir => {
  const dirPath = path.join(basePages, dir);
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jsx'));
  files.forEach(f => {
    const fullPath = path.join(dirPath, f);
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/from '\.\.\/components/g, "from '../../components");
    content = content.replace(/from '\.\.\/store/g, "from '../../store");
    fs.writeFileSync(fullPath, content);
  });
});
console.log("Imports rewritten for subfolder architecture!");

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('translations_dump.json', 'utf8'));
const { en, ru, he, all } = data;

// Scan app, components, lib for t('...') usage and raw strings
function getFiles(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res = res.concat(getFiles(full));
    } else if (/\.(tsx|ts|js|jsx)$/.test(file) && !file.includes('check_i18n')) {
      res.push(full);
    }
  }
  return res;
}

const files = [...getFiles('app'), ...getFiles('components'), ...getFiles('lib')];
const keyUsage = {};
all.forEach(k => keyUsage[k] = []);

const fileContents = {};
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  fileContents[file] = content;
  // find t('key')
  const matches = content.matchAll(/\bt\(['"]([a-zA-Z0-9_]+)['"]\)/g);
  for (const m of matches) {
    const k = m[1];
    if (keyUsage[k]) {
      keyUsage[k].push(file);
    } else {
      console.log(`Unknown translation key used: "${k}" in ${file}`);
    }
  }
  // also check NAV or SEARCH_INDEX or other indirect uses
  const constMatches = content.matchAll(/'([a-zA-Z0-9_]+)'/g);
  for (const m of constMatches) {
    const k = m[1];
    if (keyUsage[k] && !keyUsage[k].includes(file)) {
      keyUsage[k].push(file);
    }
  }
}

const unused = all.filter(k => keyUsage[k].length === 0);
console.log('Unused keys:', unused);

// Check hardcoded texts in JSX
console.log('\n--- Checking JSX for potential untranslated text ---');
for (const file of files) {
  if (file.includes('lib\\i18n.tsx')) continue;
  const content = fileContents[file];
  // Look for text nodes in JSX like >Some text<
  const textNodes = content.matchAll(/>([^<>{}\n]+)</g);
  for (const m of textNodes) {
    const txt = m[1].trim();
    if (txt && !/^[\d\s\.,·—–°%/#+:©→←\-]+$/.test(txt)) {
      // Exclude brand names like rosso garage, Rosso Spider
      if (!/^(rosso|garage|Rosso|Spider|Rosso Spider|rosso garage)$/.test(txt)) {
        console.log(`Potential hardcoded text in ${file}: "${txt}"`);
      }
    }
  }
}

// Write detailed comparison
let md = '# Translation Comparison Table\n\n| Key | English | Русский | עברית |\n|---|---|---|---|\n';
for (const k of all) {
  md += `| \`${k}\` | ${en[k].replace(/\|/g, '\\|')} | ${ru[k].replace(/\|/g, '\\|')} | ${he[k].replace(/\|/g, '\\|')} |\n`;
}
fs.writeFileSync('translations_table.md', md, 'utf8');
console.log('Generated translations_table.md');

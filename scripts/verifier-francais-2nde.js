// Vérifie que le Français de la 2nde C reprend, leçon par leçon, celui de la 2nde A.
// Usage : node scripts/verifier-francais-2nde.js   (code de sortie 1 en cas d'écart)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Extrait l'objet littéral `const DATA = {...}` d'index.html et l'évalue (dernière définition de chaque clé).
function chargerDATA(fichier) {
  const src = fs.readFileSync(fichier, 'utf8');
  const debut = src.indexOf('{', src.indexOf('const DATA = '));
  let prof = 0, quote = null, k;
  for (k = debut; k < src.length; k++) {
    const c = src[k];
    if (quote) { if (c === '\\') { k++; continue; } if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '{') prof++;
    else if (c === '}' && --prof === 0) break;
  }
  return vm.runInNewContext('(' + src.slice(debut, k + 1) + ')');
}

const DATA = chargerDATA(path.join(__dirname, '..', 'index.html'));
const francais = classe => {
  const m = (DATA[classe]?.matieres || []).filter(x => x.name === 'Français');
  if (m.length !== 1) throw new Error(`${classe} : ${m.length} bloc(s) Français au lieu de 1`);
  return m[0].lecons;
};
const A = francais('2nde A');
const C = francais('2nde C');

const ecarts = [];
for (let i = 0; i < Math.max(A.length, C.length); i++) {
  const a = A[i], c = C[i];
  if (!a || !c || a.title !== c.title || a.sub !== c.sub) {
    ecarts.push(`  n°${i + 1}\n    2nde A : ${a ? `${a.title} | ${a.sub}` : '(absente)'}\n    2nde C : ${c ? `${c.title} | ${c.sub}` : '(absente)'}`);
  }
}

console.log(`2nde A : ${A.length} leçons — 2nde C : ${C.length} leçons`);
if (ecarts.length === 0) {
  console.log(`${A.length}/${A.length} identiques (title et sub, dans le même ordre)`);
} else {
  console.log(`${ecarts.length} écart(s) :\n${ecarts.join('\n')}`);
  process.exitCode = 1;
}

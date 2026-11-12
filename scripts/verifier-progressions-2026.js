// Compare Physique-Chimie, SVT, Histoire et Géographie de chaque classe (index.html, const DATA)
// aux progressions officielles 2026-2027 (scripts/progressions-2026-pc-svt-hg.json) : titres et ordre.
// Usage : node scripts/verifier-progressions-2026.js   (code de sortie 1 si un écart existe)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'progressions-2026-pc-svt-hg.json'), 'utf8'));

// Écarts ignorés : casse, apostrophes droites/typographiques, espaces. Le préfixe
// « Histoire – » / « Géographie – » est exigé dans les listes d'Histoire-Géographie.
const normaliser = s => s.normalize('NFC').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

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
const HG = /^(Histoire-Géographie|Histoire-Géo|Histoire|Géographie)$/;
let echecs = 0, controles = 0;

function comparer(libelle, attendu, lecons) {
  controles++;
  const erreurs = [];
  if (lecons.length !== attendu.length) erreurs.push(`  nombre de leçons : ${lecons.length} au lieu de ${attendu.length}`);
  for (let i = 0; i < Math.max(lecons.length, attendu.length); i++) {
    const a = lecons[i]?.title, o = attendu[i];
    if (a === undefined || o === undefined || normaliser(a) !== normaliser(o))
      erreurs.push(`  n°${i + 1} : EduCI « ${a ?? '(absente)'} » / officiel « ${o ?? '(absente)'} »`);
  }
  if (erreurs.length) { echecs++; console.log(`✗ ${libelle}\n${erreurs.join('\n')}`); }
  else console.log(`✓ ${libelle} : ${lecons.length}/${attendu.length} conformes, dans l'ordre`);
}

for (const discipline of ['Physique-Chimie', 'SVT']) {
  for (const [classePDF, liste] of Object.entries(REF.listes[discipline])) {
    for (const classe of REF.classes[classePDF]) {
      const m = (DATA[classe]?.matieres || []).filter(x => x.name === discipline);
      if (m.length !== 1) { echecs++; controles++; console.log(`✗ ${discipline} ${classe} : ${m.length} matière(s) au lieu de 1`); continue; }
      comparer(`${discipline} ${classe}`, liste.map(x => x.titre), m[0].lecons);
    }
  }
}

// Histoire-Géographie : liste Histoire puis liste Géographie, titres préfixés
for (const [classePDF, histoire] of Object.entries(REF.listes.Histoire)) {
  const attendu = [...histoire.map(x => `Histoire – ${x.titre}`), ...REF.listes['Géographie'][classePDF].map(x => `Géographie – ${x.titre}`)];
  for (const classe of REF.classes[classePDF]) {
    const lecons = (DATA[classe]?.matieres || []).filter(x => HG.test(x.name)).flatMap(x => x.lecons);
    comparer(`Histoire-Géographie ${classe}`, attendu, lecons);
  }
}

// Aucune leçon Physique-Chimie attendue en Terminale A (absente du PDF)
for (const classe of ['Tle A1', 'Tle A2']) {
  controles++;
  if ((DATA[classe]?.matieres || []).some(x => x.name === 'Physique-Chimie')) { echecs++; console.log(`✗ Physique-Chimie présente en ${classe}`); }
}

console.log(`\n${controles - echecs}/${controles} contrôles conformes`);
if (echecs) process.exitCode = 1;

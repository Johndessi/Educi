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

// Éducation Musicale : titres, ordre et effectifs (scripts/progressions-2026-musique.json)
const MUS = JSON.parse(fs.readFileSync(path.join(__dirname, 'progressions-2026-musique.json'), 'utf8'));
for (const [classePDF, liste] of Object.entries(MUS.listes)) {
  if (liste.length !== MUS.effectifs[classePDF]) { echecs++; controles++; console.log(`✗ Éducation Musicale ${classePDF} : référence de ${liste.length} leçons au lieu de ${MUS.effectifs[classePDF]}`); }
  for (const classe of MUS.classes[classePDF]) {
    const m = (DATA[classe]?.matieres || []).filter(x => x.name === 'Éducation Musicale');
    if (m.length !== 1) { echecs++; controles++; console.log(`✗ Éducation Musicale ${classe} : ${m.length} matière(s) au lieu de 1`); continue; }
    comparer(`Éducation Musicale ${classe}`, liste, m[0].lecons);
  }
}

// Anglais et EDHC, 1er cycle (scripts/progressions-2026-anglais-edhc.json)
const AE = JSON.parse(fs.readFileSync(path.join(__dirname, 'progressions-2026-anglais-edhc.json'), 'utf8'));
for (const discipline of ['Anglais', 'EDHC']) {
  for (const [classePDF, liste] of Object.entries(AE.listes[discipline])) {
    const classe = AE.classes[classePDF];
    const m = (DATA[classe]?.matieres || []).filter(x => x.name === discipline);
    if (m.length !== 1) { echecs++; controles++; console.log(`✗ ${discipline} ${classe} : ${m.length} matière(s) au lieu de 1`); continue; }
    comparer(`${discipline} ${classe}`, liste.map(x => x.titre), m[0].lecons);
    // Sous-titres : thème officiel (Anglais) ; compétences 2 et 3 de 3e (EDHC)
    // (EDHC 6e, 5e, 4e : sous-titres hors périmètre, non contrôlés)
    if (discipline === 'EDHC' && classePDF !== '3e') continue;
    const attendus = discipline === 'Anglais'
      ? liste.map(x => x.theme)
      : m[0].lecons.map(l => AE.edhc_3e_sous_titres[(l.sub || '').match(/^Compétence \d/)?.[0]] || l.sub);
    controles++;
    const faux = m[0].lecons.map((l, i) => l.sub === attendus[i] ? null : `  n°${i + 1} : sous-titre « ${l.sub} » / attendu « ${attendus[i]} »`).filter(Boolean);
    if (faux.length) { echecs++; console.log(`✗ ${discipline} ${classe} sous-titres\n${faux.join('\n')}`); }
    else console.log(`✓ ${discipline} ${classe} : sous-titres conformes`);
  }
}

// Une seule matière de musique par classe (doublon « Musique » / « Éducation Musicale » supprimé)
let doublons = 0;
for (const [classe, d] of Object.entries(DATA)) {
  controles++;
  const musique = (d.matieres || []).filter(x => /musi/i.test(x.name)).map(x => x.name);
  if (musique.length > 1) { echecs++; doublons++; console.log(`✗ ${classe} : ${musique.length} matières musique (${musique.join(', ')})`); }
}
if (!doublons) console.log(`✓ musique : une seule matière dans chacune des ${Object.keys(DATA).length} classes`);

console.log(`\n${controles - echecs}/${controles} contrôles conformes`);
if (echecs) process.exitCode = 1;

// Compare les Mathématiques de chaque classe (index.html, const DATA) à la progression
// officielle 2026-2027 (Coordination nationale de Mathématiques).
// Usage : node scripts/verifier-maths-2026.js   (code de sortie 1 si un écart non toléré existe)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const OFFICIEL = {
  '6ème': ['Nombres entiers naturels', 'Droites et points', 'Nombres décimaux relatifs', 'Segments', 'Pavés droits et cylindres droits', 'Fractions', 'Cercles et disques', 'Angles', 'Triangles', 'Proportionnalité', 'Figures symétriques par rapport à un point', 'Statistique', 'Parallélogramme'],
  '5ème': ['Nombres premiers', 'Segments', 'Angles', 'Nombres décimaux relatifs', 'Figures symétriques par rapport à une droite', 'Fractions', 'Prismes droits', 'Triangles', 'Proportionnalité', 'Cercles', 'Statistique', 'Parallélogrammes particuliers'],
  '4ème': ['Nombres décimaux relatifs', 'Angles', 'Nombres rationnels', 'Distances', 'Perspective cavalière', 'Calcul littéral', 'Cercles et triangles', 'Équations et inéquations dans ℚ', 'Vecteurs', 'Statistique', 'Symétries et translations'],
  '3ème': ['Calcul littéral', 'Propriétés de Thalès dans un triangle', 'Racines carrées', 'Triangle rectangle', 'Calcul numérique', 'Angles inscrits', 'Vecteurs', 'Équations et inéquations dans ℝ', 'Pyramides et cônes', 'Statistique', 'Coordonnées de vecteurs', 'Équations de droites', 'Applications affines', 'Équations et inéquations dans ℝ × ℝ'],
  '2nde A': ['Calcul numérique', 'Dénombrement', 'Calcul littéral', 'Équations et inéquations dans ℝ', 'Généralités sur les fonctions', 'Étude de fonctions élémentaires', 'Statistique', 'Systèmes d’équations linéaires dans ℝ × ℝ'],
  '2nde C': ['Vecteurs et points du plan', 'Ensemble des nombres réels', 'Utilisation des symétries et translations', 'Généralités sur les fonctions', 'Droites et plans de l’espace', 'Fonctions polynômes et fractions rationnelles', 'Angles inscrits', 'Angles orientés et trigonométrie', 'Statistique à une variable', 'Produit scalaire', 'Équations et inéquations dans ℝ', 'Homothéties', 'Étude de fonctions élémentaires', 'Rotations', 'Inéquations dans ℝ × ℝ'],
  '1ère A1': ['Équations et inéquations', 'Dénombrement', 'Généralités sur les fonctions', 'Dérivabilité et étude de fonctions', 'Suites numériques', 'Statistique', 'Systèmes d’équations dans ℝ × ℝ'],
  '1ère A2': ['Équations et inéquations dans ℝ', 'Dénombrement', 'Généralités sur les fonctions', 'Dérivabilité et étude de fonctions', 'Suites numériques', 'Statistique', 'Systèmes d’équations linéaires dans ℝ × ℝ'],
  '1ère C': ['Équations et inéquations dans ℝ', 'Angles orientés et trigonométrie', 'Généralités sur les fonctions', 'Barycentre', 'Limites et continuité', 'Dénombrement', 'Extension de la notion de limite', 'Composées de transformations du plan', 'Dérivation', 'Orthogonalité de l’espace', 'Étude et représentation graphique d’une fonction', 'Probabilité', 'Système d’équations linéaires dans ℝ² et dans ℝ³', 'Géométrie analytique du plan', 'Suites numériques', 'Vecteurs de l’espace', 'Statistique à une variable'],
  '1ère D': ['Équations et inéquations du second degré dans ℝ', 'Angles orientés et trigonométrie', 'Généralités sur les fonctions', 'Limites et continuité', 'Dénombrement', 'Dérivation', 'Extension de la notion de limite', 'Barycentre', 'Étude et représentation graphique d’une fonction', 'Probabilité', 'Suites numériques', 'Composées de transformations du plan', 'Statistique à une variable', 'Systèmes d’équations linéaires dans ℝ² et dans ℝ³', 'Orthogonalité dans l’espace'],
  'Tle A1': ['Étude de fonctions polynômes et de fonctions rationnelles', 'Probabilité et variable aléatoire', 'Primitives et calcul intégral', 'Fonction logarithme népérien', 'Fonction exponentielle népérienne', 'Statistique à deux variables', 'Suites numériques', 'Systèmes d’équations linéaires dans ℝ × ℝ'],
  'Tle A2': ['Étude de fonctions polynômes et de fonctions rationnelles', 'Probabilité', 'Fonction logarithme népérien', 'Fonction exponentielle népérienne', 'Statistique à deux variables', 'Suites numériques', 'Systèmes d’équations linéaires dans ℝ × ℝ'],
  'Tle C': ['Barycentre et lignes de niveaux', 'Limites et continuité', 'Divisibilité dans ℤ', 'Dérivabilité et étude de fonctions', 'Géométrie analytique de l’espace', 'Primitives', 'Fonctions logarithmes', 'Coniques', 'Fonctions exponentielles et fonctions puissances', 'Nombres complexes', 'PPCM et PGCD de deux entiers relatifs', 'Suites numériques', 'Isométries du plan', 'Calcul intégral', 'Similitudes directes du plan', 'Probabilité conditionnelle et variable aléatoire', 'Nombres complexes et géométrie du plan', 'Statistique à deux variables', 'Équations différentielles'],
  'Tle D': ['Limites et continuité', 'Probabilité conditionnelle et variable aléatoire', 'Dérivabilité et étude de fonctions', 'Primitives', 'Fonctions logarithmes', 'Fonctions exponentielles et puissances', 'Suites numériques', 'Nombres complexes', 'Calcul intégral', 'Nombres complexes et géométrie du plan', 'Statistiques à deux variables', 'Équations différentielles'],
};

// Écarts typographiques acceptés : listés, sans échec. Numéros de leçon (1 = première).
const TOLERES = { 'Tle D': [6, 11], '1ère A1': [7], '1ère C': [10, 13] };

// Normalisation : apostrophes droites/typographiques, casse, espaces autour de « × ».
const normaliser = s => s.normalize('NFC')
  .replace(/[’‘`´]/g, "'")
  .replace(/\s*×\s*/g, ' × ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

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
let echecs = 0;
const toleres = [];

for (const [classe, attendu] of Object.entries(OFFICIEL)) {
  const blocs = (DATA[classe]?.matieres || []).filter(m => m.name === 'Mathématiques');
  if (blocs.length !== 1) { console.log(`✗ ${classe} : ${blocs.length} bloc(s) Mathématiques au lieu de 1`); echecs++; continue; }
  const lecons = blocs[0].lecons;
  const erreurs = [];
  if (lecons.length !== attendu.length) erreurs.push(`  nombre de leçons : ${lecons.length} au lieu de ${attendu.length}`);
  for (let i = 0; i < Math.max(lecons.length, attendu.length); i++) {
    const eduCI = lecons[i]?.title, officiel = attendu[i];
    if (eduCI !== undefined && officiel !== undefined && normaliser(eduCI) === normaliser(officiel)) continue;
    const ligne = `n°${i + 1} : EduCI « ${eduCI ?? '(absente)'} » / officiel « ${officiel ?? '(absente)'} »`;
    if ((TOLERES[classe] || []).includes(i + 1) && eduCI !== undefined && officiel !== undefined) toleres.push(`  ${classe} ${ligne}`);
    else erreurs.push('  ' + ligne);
  }
  if (erreurs.length) { console.log(`✗ ${classe}\n${erreurs.join('\n')}`); echecs++; }
  else console.log(`✓ ${classe} : ${lecons.length}/${attendu.length} leçons conformes, dans l'ordre`);
}

if (toleres.length) console.log(`\nÉcarts typographiques tolérés (${toleres.length}) :\n${toleres.join('\n')}`);
console.log(`\n${Object.keys(OFFICIEL).length - echecs}/${Object.keys(OFFICIEL).length} classes conformes`);
if (echecs) process.exitCode = 1;

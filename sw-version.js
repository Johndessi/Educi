// Version du service worker, calculée au démarrage du serveur à partir du contenu
// des fichiers mis en cache. Elle change dès que index.html, sw.js ou manifest.json
// change : le navigateur voit alors un sw.js différent, installe le nouveau service
// worker, et l'ancien cache est supprimé à l'activation.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = "'__SW_VERSION__'";
const FICHIERS_VERSIONNES = ['index.html', 'sw.js', 'manifest.json'];

function calculerVersionSW(dossier) {
  const hash = crypto.createHash('sha256');
  for (const f of FICHIERS_VERSIONNES) hash.update(fs.readFileSync(path.join(dossier, f)));
  return hash.digest('hex').slice(0, 12);
}

// Renvoie le source de sw.js avec la version injectée.
function sourceSW(dossier) {
  const brut = fs.readFileSync(path.join(dossier, 'sw.js'), 'utf8');
  if (!brut.includes(PLACEHOLDER)) throw new Error(`sw.js : marqueur ${PLACEHOLDER} introuvable`);
  const version = calculerVersionSW(dossier);
  return { version, source: brut.replace(PLACEHOLDER, JSON.stringify(version)) };
}

module.exports = { calculerVersionSW, sourceSW, PLACEHOLDER };

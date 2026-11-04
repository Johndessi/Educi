// Tests de la version du service worker (sw-version.js). Lancer : npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { calculerVersionSW, sourceSW, PLACEHOLDER } = require('../sw-version');

const RACINE = path.join(__dirname, '..');

// Copie les fichiers versionnés dans un dossier temporaire pour pouvoir les modifier.
function copieTemporaire() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'educi-sw-'));
  for (const f of ['index.html', 'sw.js', 'manifest.json']) fs.copyFileSync(path.join(RACINE, f), path.join(dir, f));
  return dir;
}

test('sw.js du dépôt contient le marqueur de version', () => {
  assert.ok(fs.readFileSync(path.join(RACINE, 'sw.js'), 'utf8').includes(PLACEHOLDER));
});

test('le marqueur est remplacé par la version, et le cache en dépend', () => {
  const { version, source } = sourceSW(RACINE);
  assert.match(version, /^[0-9a-f]{12}$/);
  assert.ok(!source.includes(PLACEHOLDER));
  assert.ok(source.includes(`const VERSION = "${version}";`));
  assert.ok(source.includes("const CACHE = 'educi-' + VERSION;"));
});

test('la version change quand index.html change, et seulement alors', () => {
  const dir = copieTemporaire();
  const v1 = calculerVersionSW(dir);
  assert.strictEqual(calculerVersionSW(dir), v1, 'version stable sans modification');
  fs.appendFileSync(path.join(dir, 'index.html'), '\n<!-- modif -->');
  assert.notStrictEqual(calculerVersionSW(dir), v1);
  fs.rmSync(dir, { recursive: true, force: true });
});

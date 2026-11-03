// Tests de sousTitreLecon (index.html). Lancer : npm test
// La fonction est extraite telle quelle de index.html pour tester le code réellement servi.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const debut = src.indexOf('const _MOIS_LECON');
const fin = src.indexOf('function renderLecons');
assert.ok(debut > 0 && fin > debut, 'sousTitreLecon introuvable dans index.html');
const ctx = {};
vm.runInNewContext(src.slice(debut, fin) + ';this.sousTitreLecon = sousTitreLecon;', ctx);
const sousTitreLecon = ctx.sousTitreLecon;

test('nom de classe seul après retrait de la période → vide', () => {
  assert.strictEqual(sousTitreLecon({ sub: 'Tle A2 – 1er trimestre (19h)' }), '');
});

test('vrai libellé conservé, période et durée retirées', () => {
  assert.strictEqual(
    sousTitreLecon({ sub: "Compétence I – Étude méthodique d'un texte – 1er trimestre (30h)" }),
    "Compétence I – Étude méthodique d'un texte"
  );
});

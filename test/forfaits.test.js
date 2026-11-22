// Tests des forfaits (forfaits.js) : prix, durées, reconnaissance du montant. Lancer : npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { FORFAITS, TOLERANCE_MONTANT, forfaitPourMontant, plagesSeChevauchent, pipelineProlongation } = require('../forfaits');
const { analyserSms } = require('../paiement-sms');

test('prix et durées des forfaits', () => {
  assert.deepStrictEqual(
    Object.fromEntries(Object.entries(FORFAITS).map(([k, f]) => [k, [f.prix, f.jours]])),
    { mensuel: [2500, 30], trimestriel: [6000, 90], annuel: [15000, 365] });
  assert.strictEqual(TOLERANCE_MONTANT, 99);
});

test('montants reconnus : prix exact jusqu\'à +99 F', () => {
  const cas = { 2500: 'mensuel', 2599: 'mensuel', 6000: 'trimestriel', 6099: 'trimestriel', 15000: 'annuel', 15099: 'annuel' };
  for (const [m, f] of Object.entries(cas)) assert.strictEqual(forfaitPourMontant(Number(m)), f, m);
});

test('montants refusés : cas limites, anciens prix, montants intermédiaires', () => {
  for (const m of [2499, 2600, 5999, 6100, 14999, 15100, 500, 1200, 4000, 0, -2500, 3000, 2500.5]) {
    assert.strictEqual(forfaitPourMontant(m), null, String(m));
  }
  assert.strictEqual(forfaitPourMontant('2500'), null, 'chaîne refusée');
});

test('aucune plage de montants ne se chevauche', () => {
  assert.strictEqual(plagesSeChevauchent(), false);
});

test('SMS Orange réel aux nouveaux prix', () => {
  const sms = m => `Transfert de ${m} recu\nde SECKA 0700000000.\nRef :PP261106.0208.D00000.\nSolde : 555.00F.`;
  assert.strictEqual(forfaitPourMontant(analyserSms(sms('2 500.00F')).montant), 'mensuel');
  assert.strictEqual(forfaitPourMontant(analyserSms(sms('6000.00F')).montant), 'trimestriel');
  assert.strictEqual(forfaitPourMontant(analyserSms(sms('15.000F')).montant), 'annuel');
  assert.strictEqual(forfaitPourMontant(analyserSms(sms('500.00F')).montant), null, 'ancien prix');
});

test('prolongation : durée du forfait ajoutée au maximum (expiration en cours, maintenant)', () => {
  const maintenant = new Date('2026-11-20T00:00:00Z');
  const [{ $set }] = pipelineProlongation('trimestriel', 'sms', maintenant);
  assert.strictEqual($set.forfait, 'trimestriel');
  assert.strictEqual($set.source, 'sms');
  assert.deepStrictEqual($set.expiry,
    { $add: [{ $max: [{ $ifNull: ['$expiry', maintenant] }, maintenant] }, 90 * 86400000] });
  assert.deepStrictEqual($set.appareils, { $ifNull: ['$appareils', []] }, 'appareils conservés');
  assert.deepStrictEqual($set.createdAt, { $ifNull: ['$createdAt', maintenant] }, 'createdAt conservé');
});

test('interface : aucun prix ni durée écrits en dur sur l\'écran des forfaits', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const debut = html.indexOf('id="auth-screen-plan"'), fin = html.indexOf('id="auth-plan-err"');
  assert.ok(debut > 0 && fin > debut, 'écran des forfaits introuvable');
  const ecran = html.slice(debut, fin);
  assert.doesNotMatch(ecran, /\d[\d\s\u00A0]*F\s*</, 'prix en F écrit dans le HTML');
  assert.doesNotMatch(ecran, /\d+ jours d'accès/, 'durée écrite dans le HTML');
  assert.doesNotMatch(html, /ouvrirPaiement\('\w+',\s*\d/, 'montant passé en dur à ouvrirPaiement');
  for (const f of Object.keys(FORFAITS)) {
    assert.match(ecran, new RegExp(`data-forfait-prix="${f}"`), f);
    assert.match(ecran, new RegExp(`data-forfait-jours="${f}"`), f);
  }
});

test('interface : ouvrirPaiement est toujours appelé avec un forfait connu', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  // Tous les appels, hors définition de la fonction
  const appels = [...html.matchAll(/(function\s+)?ouvrirPaiement\s*\(([^)]*)\)/g)].filter(m => !m[1]).map(m => m[2].trim());
  assert.ok(appels.length > 0, 'aucun appel à ouvrirPaiement trouvé');
  for (const arg of appels) {
    assert.notStrictEqual(arg, '', 'ouvrirPaiement() appelé sans argument');
    const cle = /^'(\w+)'$/.exec(arg)?.[1];
    assert.ok(cle && cle in FORFAITS, `ouvrirPaiement(${arg}) : forfait inconnu`);
  }
});

// Tests de l'analyse des SMS Orange Money (paiement-sms.js). Lancer : npm test
const test = require('node:test');
const assert = require('node:assert');
const { extraireMontant, extraireTel, extraireReference, analyserSms } = require('../paiement-sms');

// SMS réel anonymisé (numéro et référence modifiés)
const SMS = 'De : +454\nTransfert de 500.00F recu\nde SECKA 0700000000.\nRef :PP261106.0208.D00000.\nSolde : 555.00F. Vos transferts et\npaiements sont a 0F. OMCI vous\nremercie.';
const avecMontant = m => SMS.replace('500.00F', m);

test('SMS réel : montant, numéro, référence', () => {
  assert.deepStrictEqual(analyserSms(SMS),
    { ok: true, montant: 500, telephone: '0700000000', reference: 'PP261106.0208.D00000' });
});

test('variantes du SMS réel', () => {
  assert.strictEqual(analyserSms(avecMontant('2500.00F')).montant, 2500);
  assert.strictEqual(analyserSms(avecMontant('2 500.00F')).montant, 2500);
  assert.strictEqual(analyserSms(avecMontant('10000.00F')).montant, 10000);
});

test('formats de montant après « Transfert de »', () => {
  const cas = {
    '500.00F': 500, '500F': 500, '2500.00F': 2500, '2 500.00F': 2500, '2\u00A0500.00F': 2500,
    '2\u202F500.00F': 2500, '2.500F': 2500, '2,500.00F': 2500, '1 200F': 1200, '4.000,00F': 4000,
    '10000.00F': 10000, '1 234 567F': 1234567,
  };
  for (const [ecrit, attendu] of Object.entries(cas)) {
    assert.strictEqual(extraireMontant(`Transfert de ${ecrit} recu de A 0700000000.`), attendu, ecrit);
  }
});

test('montant : le solde est ignoré et rien n\'est deviné', () => {
  assert.strictEqual(extraireMontant('Solde : 555.00F. Transfert de 500.00F recu'), 0, 'montant après « Solde »');
  assert.strictEqual(extraireMontant('Vous avez recu 500.00F de A 0700000000. Solde : 555.00F'), 0, 'sans « Transfert de »');
  assert.strictEqual(extraireMontant('Transfert de 2.50.0F'), 0, 'format incohérent');
});

test('numéro : après « recu de <NOM> », 10 chiffres, jamais tronqué', () => {
  assert.strictEqual(extraireTel('recu\nde SECKA 0700000000.'), '0700000000');
  assert.strictEqual(extraireTel('recu de KOUAME YAO JEAN-MARC 0712345678.'), '0712345678', 'nom de plusieurs mots');
  assert.strictEqual(extraireTel('reçu de N\'GUESSAN 07 12 34 56 78.'), '0712345678', 'chiffres espacés');
  assert.strictEqual(extraireTel('recu de A +2250712345678.'), '0712345678', 'préfixe +225');
  assert.strictEqual(extraireTel('recu de A 070000000.'), null, '9 chiffres refusés');
  assert.strictEqual(extraireTel('recu de A 07000000001.'), null, '11 chiffres refusés, pas tronqués');
  assert.strictEqual(extraireTel('recu de SECKA. Solde : 0700000000'), null, 'numéro après « Solde » ignoré');
});

test('référence sans ponctuation finale', () => {
  assert.strictEqual(extraireReference('Ref :PP261106.0208.D00000.'), 'PP261106.0208.D00000');
  assert.strictEqual(extraireReference('Ref: PP261106.0208.D00000'), 'PP261106.0208.D00000');
  assert.strictEqual(extraireReference('Pas de référence ici'), null);
});

test('refus : « vers », absence de « recu de », texte vide', () => {
  assert.deepStrictEqual(analyserSms('Transfert de 500.00F vers SECKA 0700000000 reussi. Ref :PP1.'),
    { ok: false, raison: 'SMS de transfert sortant (« vers »)' });
  assert.deepStrictEqual(analyserSms(SMS.replace('recu\nde', 'envoye a')), { ok: false, raison: 'SMS sans « recu de »' });
  assert.deepStrictEqual(analyserSms(SMS + ' vers'), { ok: false, raison: 'SMS de transfert sortant (« vers »)' });
  assert.deepStrictEqual(analyserSms(''), { ok: false, raison: 'texte du SMS absent' });
});

test('les raisons de refus ne contiennent ni nom ni numéro', () => {
  for (const t of [SMS.replace('0700000000', '070000000'), SMS.replace('500.00F', 'cinq cents F'), SMS + ' vers']) {
    const r = analyserSms(t);
    assert.strictEqual(r.ok, false);
    assert.ok(!/SECKA|07000|PP26/.test(r.raison), r.raison);
  }
});

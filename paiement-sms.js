// Analyse d'un SMS Orange Money de transfert reçu, par exemple :
//   "Transfert de 500.00F recu\nde SECKA 0700000000.\nRef :PP261106.0208.D00000.\nSolde : 555.00F. …"
// Aucune fonction de ce module ne journalise quoi que ce soit.

const ESPACES = /[\s  ]/g;   // espaces, y compris insécables (U+00A0, U+202F)

// Partie du SMS avant « Solde » : le solde du compte ne doit jamais être lu comme montant.
function avantSolde(texte) {
  const i = texte.search(/solde/i);
  return i === -1 ? texte : texte.slice(0, i);
}

// Montant en FCFA (entier) lu juste après « Transfert de ». 0 si absent ou illisible.
// Formats : 500F, 500.00F, 2500.00F, 2 500.00F, 2.500F, 2,500.00F (espaces insécables acceptés).
function extraireMontant(texte) {
  const m = /transfert\s+de\s+(\d[\d\s  .,]*?)\s*F/i.exec(avantSolde(String(texte || '')));
  if (!m) return 0;
  let brut = m[1].replace(ESPACES, '');
  // Décimales : séparateur suivi de 1 ou 2 chiffres en fin de nombre (500.00, 2,500.00)
  brut = brut.replace(/[.,]\d{1,2}$/, '');
  // Partie entière : chiffres seuls, ou groupes de 3 séparés par « . » ou « , » (2.500, 2,500)
  if (/^\d+$/.test(brut)) return parseInt(brut, 10);
  if (/^\d{1,3}([.,]\d{3})+$/.test(brut)) return parseInt(brut.replace(/[.,]/g, ''), 10);
  return 0;
}

// Numéro du payeur, lu juste après « recu de <NOM> » (nom de un ou plusieurs mots).
// Renvoie exactement 10 chiffres (préfixe 225 retiré), sinon null : jamais de troncature.
function extraireTel(texte) {
  const m = /re[çc]u\s+de\s+[^\d+]*?(\+?\d[\d\s  ]*\d)/i.exec(avantSolde(String(texte || '')));
  if (!m) return null;
  let chiffres = m[1].replace(/\D/g, '');
  if (chiffres.length === 13 && chiffres.startsWith('225')) chiffres = chiffres.slice(3);
  return chiffres.length === 10 ? chiffres : null;
}

// Référence de transaction (« Ref :PP261106.0208.D00000. »), sans ponctuation finale. null si absente.
function extraireReference(texte) {
  const m = /(?:trans(?:action)?\s*id|id\s*(?:de\s*)?transaction|r[ée]f(?:[ée]rence)?)\s*[:.]?\s*([A-Z0-9][A-Z0-9.\-]{5,})/i
    .exec(String(texte || ''));
  if (!m) return null;
  return m[1].replace(/[.,;:!?\-]+$/, '') || null;
}

// Analyse complète. Renvoie { ok: true, montant, telephone, reference }
// ou { ok: false, raison } — la raison ne contient ni texte, ni nom, ni numéro.
function analyserSms(texte) {
  const t = String(texte || '');
  if (!t.trim()) return { ok: false, raison: 'texte du SMS absent' };
  if (/\bvers\b/i.test(t)) return { ok: false, raison: 'SMS de transfert sortant (« vers »)' };
  if (!/re[çc]u\s+de\b/i.test(t)) return { ok: false, raison: 'SMS sans « recu de »' };
  const montant = extraireMontant(t);
  if (!montant) return { ok: false, raison: 'montant illisible après « Transfert de »' };
  const telephone = extraireTel(t);
  if (!telephone) return { ok: false, raison: 'numéro du payeur introuvable ou pas sur 10 chiffres' };
  return { ok: true, montant, telephone, reference: extraireReference(t) };
}

module.exports = { extraireMontant, extraireTel, extraireReference, analyserSms };

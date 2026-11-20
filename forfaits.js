// Forfaits EduCI : seule définition des prix et des durées.
// Utilisée par server.js (webhooks de paiement, admin) et servie à l'interface par GET /api/forfaits.

const FORFAITS = Object.freeze({
  mensuel:     Object.freeze({ prix: 2500,  jours: 30,  label: '1 mois' }),
  trimestriel: Object.freeze({ prix: 6000,  jours: 90,  label: '3 mois' }),
  annuel:      Object.freeze({ prix: 15000, jours: 365, label: '1 an'   }),
});

// Frais tolérés au-dessus du prix pour reconnaître un paiement (ex. 2 500 à 2 599 F)
const TOLERANCE_MONTANT = 99;

// Forfait correspondant au montant reçu : prix exact, jusqu'à +TOLERANCE_MONTANT. null sinon.
function forfaitPourMontant(montant) {
  if (!Number.isInteger(montant)) return null;
  return Object.keys(FORFAITS).find(f =>
    montant >= FORFAITS[f].prix && montant <= FORFAITS[f].prix + TOLERANCE_MONTANT) || null;
}

// Les plages [prix, prix + tolérance] ne doivent jamais se chevaucher.
function plagesSeChevauchent() {
  const p = Object.values(FORFAITS).map(f => [f.prix, f.prix + TOLERANCE_MONTANT]).sort((a, b) => a[0] - b[0]);
  return p.some((x, i) => i > 0 && x[0] <= p[i - 1][1]);
}
if (plagesSeChevauchent()) throw new Error('forfaits.js : plages de montants qui se chevauchent');

// Prolongation, en une seule opération atomique MongoDB (pipeline d'update) : les jours
// s'ajoutent à l'expiration en cours si elle est encore à venir, sinon à partir de maintenant.
// Deux paiements simultanés pour le même numéro s'additionnent au lieu de s'écraser.
// À la création, appareils et createdAt reçoivent leur valeur par défaut (comme setDefaultsOnInsert).
function pipelineProlongation(forfait, source, maintenant = new Date()) {
  return [{ $set: {
    forfait,
    source,
    expiry: { $add: [{ $max: [{ $ifNull: ['$expiry', maintenant] }, maintenant] }, FORFAITS[forfait].jours * 86400000] },
    appareils: { $ifNull: ['$appareils', []] },
    createdAt: { $ifNull: ['$createdAt', maintenant] },
  } }];
}

module.exports = { FORFAITS, TOLERANCE_MONTANT, forfaitPourMontant, plagesSeChevauchent, pipelineProlongation };

 const express = require('express');
const path = require('path');
const fs   = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// --- Routes PWA statiques (avant tout le reste) ---
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '.well-known', 'assetlinks.json'));
});

app.use('/icons', express.static(path.join(__dirname, 'icons'), { maxAge: '7d' }));
// ---------------------------------------------------

app.use(express.static(__dirname));

const SYSTEM_PROMPT = `Tu es le Professeur d'EduCI, application educative ivoirienne. Tu aides les eleves du secondaire (3ème, Terminale A, C et D) à comprendre leurs cours.

REGLES IMPORTANTES :
- Explique clairement et simplement selon le niveau de l'eleve
- Utilise des exemples concrets tires du quotidien ivoirien
- Pour les formules mathematiques, physique et chimie : ecris-les en texte simple et lisible
  Exemple : "F = m x a" au lieu de code LaTeX
  Exemple : "E = AN/AC" pour les fractions geometriques
  Exemple : "E = 1/2 x m x v2" pour l'energie cinetique
- Pour la SVT : decris clairement les schemas et figures en texte
- Encourage toujours l'eleve
- Reponds en francais clair et simple

CONNAISSANCE TEXTE ARGUMENTATIF – 3ème (DPFC Côte d'Ivoire)

Quand un élève pose une question sur le texte argumentatif ou le sujet de réflexion, explique toujours cette structure :

STRUCTURE DU DEVOIR :
1. L'INTRODUCTION (3 parties)
   - L'amorce : commence par une idée générale liée au thème
   - L'annonce de la situation : insère ou reformule le sujet donné
   - L'annonce du plan : dis comment tu vas organiser ton développement

2. LE DÉVELOPPEMENT
   - Idée 1 + explication + exemple concret
   - Connecteur logique (De plus, Par ailleurs, En outre...)
   - Idée 2 + explication + exemple concret
   - Connecteur logique
   - Idée 3 + explication + exemple concret

3. LA CONCLUSION (2 parties)
   - Le bilan : résume les idées développées
   - L'ouverture : pose une question ou élargis le sujet

DEUX CONSIGNES POSSIBLES :
- ÉTAYER = soutenir et prouver la thèse (tu es d'accord avec l'auteur)
- RÉFUTER = contredire la thèse avec une antithèse + contre-arguments

OUTILS DE LA LANGUE à utiliser :
- Connecteurs logiques, lexique du thème, temps verbaux adaptés, pronominalisations

CONNAISSANCE RÉSUMÉ DE TEXTE ARGUMENTATIF – 3ème (DPFC)

Quand un élève pose une question sur le résumé de texte argumentatif, explique ces 5 étapes :

ÉTAPE 1 – INDICES D'ÉNONCIATION
Identifie dans le texte original :
- La personne qui parle (1ère personne = "je/nous", 2ème = "tu/vous")
- Le temps verbal dominant
- Les types de phrases utilisées
→ Tu dois garder les mêmes dans ton résumé

ÉTAPE 2 – SÉLECTION DES IDÉES ESSENTIELLES
Lis chaque paragraphe et relève l'idée principale de chacun (une idée par paragraphe)

ÉTAPE 3 – ENCHAÎNEMENT LOGIQUE
Repère les connecteurs logiques du texte original, puis propose des équivalents
Exemples : D'abord → Pour commencer / Par ailleurs → En outre / Pour toutes ces raisons → Donc

ÉTAPE 4 – REFORMULATION
Réécris chaque idée essentielle avec tes propres mots. Ne recopie jamais le texte original.

ÉTAPE 5 – RÉDACTION
Rédige le résumé au 1/3 du volume du texte original avec une marge de ±10%
Exemple : texte de 300 mots → résumé entre 90 et 110 mots

CONTRAINTES OBLIGATOIRES DU RÉSUMÉ :
- Zéro copier-coller du texte original
- Respecter la thèse de l'auteur (ne pas déformer le sens)
- Mêmes indices d'énonciation que le texte original
- Connecteurs logiques présents entre les idées
- Respecter le volume demandé (1/3 ±10%)

CONNAISSANCE RÉSUMÉ DE TEXTE INFORMATIF – 4ème (DPFC)

Quand un élève de 4ème pose une question sur le résumé de texte informatif, explique cette structure :

DÉFINITION
Le résumé de texte est un exercice qui consiste à réduire le texte initial à un volume donné tout en restant fidèle à la pensée de l'auteur.
ATTENTION : le résumé ne comporte ni introduction, ni développement, ni conclusion.

PARTIE 1 – RÉPONSES AUX QUESTIONS
A- Compréhension :
- Le thème : répond à "De quoi parle le texte ?" → toujours sous forme nominale
- La thèse de l'auteur : le point de vue ou l'opinion de l'auteur sur le thème
- La justification de la thèse : les expressions ou phrases du texte qui prouvent la thèse

PARTIE 2 – RÉSUMÉ PROPREMENT DIT (4 étapes)
Étape 1 : Lecture du texte (au moins 3 lectures jusqu'à compréhension)
Étape 2 : Identification des idées essentielles
  - Garder les informations importantes
  - Éliminer : exemples, répétitions, détails
  - Attention à : la ponctuation explicative (: et parenthèses), les énumérations, les termes explicatifs (En effet, car, c'est-à-dire...)
Étape 3 : Reformulation avec ses propres mots
  - Transformer les subordonnées relatives → adjectif qualificatif
  - Transformer les subordonnées circonstancielles → groupe nominal
  - Utiliser les mêmes pronoms que l'auteur
Étape 4 : Rédaction du résumé au 1/3 du volume original
  - Mentionner le nombre de mots au bas de la copie

CONTRAINTES OBLIGATOIRES :
- Suivre l'ordre du texte
- Ne rien ajouter aux idées du texte
- Ne pas porter de jugement personnel
- Pas de titre dans le résumé
- Pas de mots familiers, pas d'abréviations
- Mentionner le nombre de mots à la fin

CONNAISSANCE TEXTE EXPLICATIF – 4ème (DPFC)

DÉFINITION
Un texte explicatif sert à donner des explications sur un phénomène naturel, scientifique ou socioculturel.
Deux types : phénomène naturel (pluie, inondation, germination...) et pratiques socioculturelles (fête, mariage traditionnel, cérémonie...).

PROCÉDÉS D'ÉCRITURE (à utiliser obligatoirement) :
- Lexique spécialisé propre au thème
- Mots/expressions explicatifs : c'est-à-dire, en d'autres termes...
- Mots de liaison : d'abord, ensuite, enfin...
- Ton neutre et objectif : présent de vérité (indicatif ou infinitif)
- Ponctuation explicative : deux points (:), parenthèses, points de suspension
- Subordonnées relatives explicatives
- Présentatifs
- Exemples et données chiffrées

STRUCTURE :
1. INTRODUCTION (3 éléments)
   - La généralité ou définition du thème
   - Montrer l'importance du sujet
   - Annoncer le plan ou le déroulement

2. DÉVELOPPEMENT (pour chaque paragraphe)
   - L'argument
   - L'explication de l'argument
   - L'illustration ou exemple
   - La transition

3. CONCLUSION
   - Rappeler brièvement les acquis du développement
   - Faire des observations

CONNAISSANCE COMPTE RENDU DE RÉUNION – 4ème (DPFC)

DÉFINITION
Un compte rendu de réunion est un rapport complet rédigé après une réunion.

PRÉSENTATION FORMELLE (12 éléments obligatoires dans l'ordre) :
1. L'entête
2. L'intitulé
3. La date
4. Le lieu
5. L'heure
6. Le nom du responsable
7. Le rapporteur
8. Les membres présents
9. Les membres absents
10. L'ordre du jour
11. Le déroulement de la réunion
12. La signature du rapporteur

RÉDACTION :
- Débute par une phrase d'introduction mentionnant la nature, la date, l'heure et le lieu de la réunion
- Résume brièvement chaque intervention en signalant l'auteur
- Pour les débats : reprendre l'idée générale sans entrer dans les détails
- Se termine par une formule constatant l'épuisement de l'ordre du jour et l'heure de la levée de séance

CONNAISSANCE DIALOGUE ARGUMENTATIF – 4ème (DPFC)

DÉFINITION
Un dialogue argumentatif est un échange entre deux ou plusieurs personnes qui ne partagent pas le même point de vue. Son but : raisonner et soutenir un point de vue pour convaincre.

DEUX TYPES :
A) Exprimer un point de vue personnel (discours direct, les personnages parlent eux-mêmes)
B) Rapporter des points de vue (un narrateur rapporte la discussion)

STRUCTURE COMMUNE (3 parties) :
1. INTRODUCTION
   - Sujet de discussion
   - Nommer les interlocuteurs
   - Préciser les différents points de vue
   - Préciser le lieu et le moment

2. DÉVELOPPEMENT
   - Les interlocuteurs interviennent l'un après l'autre
   - Chaque argumentation : thèse → arguments → illustration
   - Pour le type B : mentionner l'intervention du narrateur

3. CONCLUSION
   - Type A : dire sur quelle note le dialogue s'est achevé (accord ou désaccord)
   - Type B : le narrateur fait le bilan des échanges

OUTILS DE LA LANGUE :
- Indices de la personne (1re et 2e personne)
- Marques du dialogue : tirets, alinéas, discours direct
- Types et formes de phrases
- Temps verbaux : présent, passé simple, imparfait
- Verbes interlocuteurs et verbes introducteurs

CONNAISSANCE LETTRE OFFICIELLE – 4ème (DPFC)

DÉFINITION
Une lettre officielle est une lettre adressée à une autorité compétente pour demander une information, un emploi, une pièce administrative...

CARACTÉRISTIQUES :
- Structure formelle stricte
- Niveau de langue soutenu
- Ton respectueux et formel
- Mise en page et typographie soignées

9 PARTIES OBLIGATOIRES (dans l'ordre) :
1. Le lieu et la date
2. Le nom et l'adresse de l'émetteur
3. La nomination du récepteur (À Monsieur le...)
4. L'objet de la lettre
5. La formule d'appel (Monsieur le...)
6. Le corps de la lettre (la demande)
7. La formule de politesse
8. Les pièces jointes (P.J.)
9. La signature`;
app.post('/api/claude', async (req, res) => {
  try {
    const body = {
      ...req.body,
      model: 'claude-haiku-4-5-20251001',
      max_tokens: req.body.max_tokens || 1024,
      system: SYSTEM_PROMPT
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log('Status:', response.status);
    if (!response.ok) console.error('Erreur API:', data);
    res.json(data);
  } catch (error) {
    console.error('Erreur serveur:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const SUPPORT_PROMPT = `Tu es le professeur d'EduCI, plateforme éducative ivoirienne. Tu aides les élèves du secondaire en Côte d'Ivoire suivant les programmes DPFC officiels. Tu réponds en français, de façon claire, simple et encourageante. Tu t'adaptes au niveau de l'élève selon sa classe.`;

app.post('/support', async (req, res) => {
  const { telephone, classe, matiere, question } = req.body;
  if (!question) return res.status(400).json({ error: 'Le champ question est requis.' });

  const userMessage = [
    classe   ? `Classe : ${classe}`   : null,
    matiere  ? `Matière : ${matiere}` : null,
    `Question : ${question}`
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SUPPORT_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Erreur /support API Claude:', data);
      return res.status(502).json({ error: 'Erreur lors de la réponse IA.' });
    }
    const reponse = data.content?.[0]?.text || '';
    console.log(`📚 Support [${telephone || 'inconnu'}] ${classe || ''} ${matiere || ''} → ${reponse.slice(0,60)}…`);
    res.json({ reponse });
  } catch (err) {
    console.error('Erreur /support:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// === ABONNEMENTS KKIAPAY ===
const ADMIN_KEY = process.env.ADMIN_KEY || 'EDUCI_ADMIN_2026';

// Persistance JSON
const DB_PATH = path.join(__dirname, 'abonnements.json');

function chargerAbonnes() {
  try {
    if (!fs.existsSync(DB_PATH)) return new Map();
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return new Map(Object.entries(data));
  } catch (e) {
    console.error('Erreur lecture abonnements.json:', e.message);
    return new Map();
  }
}

function sauvegarder() {
  try {
    const obj = {};
    for (const [tel, sub] of abonnes.entries()) obj[tel] = sub;
    fs.writeFileSync(DB_PATH, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('Erreur écriture abonnements.json:', e.message);
  }
}

const abonnes = chargerAbonnes();
console.log(`📂 ${abonnes.size} abonnement(s) chargé(s) depuis abonnements.json`);
const FORFAITS = {
  mensuel:     { prix: 500,  jours: 30,  label: '1 mois'  },
  trimestriel: { prix: 1200, jours: 90,  label: '3 mois'  },
  annuel:      { prix: 4000, jours: 365, label: '1 an'    }
};

const KKIAPAY_PRIVATE_KEY = process.env.KKIAPAY_PRIVATE_KEY;
const KKIAPAY_SECRET      = process.env.KKIAPAY_SECRET;

// Webhook Kkiapay — appelé automatiquement après paiement réussi
app.post('/webhook-kkiapay', async (req, res) => {
  res.sendStatus(200);
  const { transactionId } = req.body;
  if (!transactionId) return;
  try {
    const r = await fetch('https://api-sandbox.kkiapay.me/api/v1/transactions/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-private-key': KKIAPAY_PRIVATE_KEY,
        'x-secret-key':  KKIAPAY_SECRET
      },
      body: JSON.stringify({ transactionId })
    });
    const data = await r.json();
    if (data.status === 'SUCCESS') {
      let meta = {};
      try { meta = JSON.parse(data.metadata || '{}'); } catch(_) {}
      const { telephone, forfait } = meta;
      if (telephone && FORFAITS[forfait]) {
        const tel    = telephone.replace(/\D/g, '');
        const expiry = new Date(Date.now() + FORFAITS[forfait].jours * 86400000);
        abonnes.set(tel, { forfait, expiry });
        sauvegarder();
        console.log(`✅ Abonnement activé : ${tel} → ${forfait} → ${expiry.toISOString()}`);
      }
    }
  } catch (err) {
    console.error('Webhook Kkiapay error:', err.message);
  }
});
// Normalise un numéro ivoirien : supprime +, espaces, tirets et le préfixe 225
// → 0712243627 / +2250712243627 / 2250712243627 donnent tous "0712243627"
function normaliserTel(t) {
  let n = String(t).replace(/[\s\-+]/g, '');
  if (n.startsWith('225')) n = n.slice(3);
  return n;
}

// === PAIEMENT MANUEL SMS (Make.com) ===
const SMS_SECRET = process.env.SMS_WEBHOOK_SECRET || 'EDUCI_SMS_2026';

app.post('/webhook-sms', (req, res) => {
  console.log('WEBHOOK RECU:', JSON.stringify(req.body));
  const body = (typeof req.body === 'object' && req.body !== null) ? req.body : {};
  console.log('📦 Body reçu complet :', JSON.stringify(body));

  // Nettoyage du champ montant : supprime sauts de ligne et caractères de contrôle
  const montantBrut = (body.montant || '').replace(/[\r\n\t]/g, ' ').trim();

  let telephone = null;
  let montantNum = 0;

  // Extrait le montant depuis une chaîne SMS (essaie FCFA d'abord, puis F CFA)
  function extraireMontant(str) {
    const m1 = str.match(/(\d+(?:\.\d+)?)\s*FCFA/i);
    if (m1) return parseInt(m1[1]);
    const m2 = str.match(/(\d[\d\s]*)\s*F(?:\s?CFA)?(?:\s|$)/i);
    return m2 ? parseInt(m2[1].replace(/\s/g, '')) : 0;
  }

  // Extrait le numéro expéditeur depuis un SMS ("du 07 12 24..." ou format ivoirien)
  function extraireTel(str) {
    const mDu  = str.match(/du\s+([\d\s]+)/i);
    if (mDu) return mDu[1].replace(/\s/g, '');
    const mTel = str.match(/(?:225)?([05701]\d{8})/);
    return mTel ? mTel[1] : null;
  }

  // Cas 0 : SMS Forwarder (x-www-form-urlencoded) — champs msg + from
  if (body.msg && body.from) {
    const sms = String(body.msg).replace(/[\r\n\t]/g, ' ').trim();
    console.log('📲 SMS Forwarder reçu — from:', body.from, '| msg:', sms);
    telephone  = String(body.from).replace(/[\s\-+]/g, '');
    montantNum = extraireMontant(sms);
  }
  // Cas 1 : body structuré avec telephone + montant
  else if ((body.telephone || body.telephone_eleve) && montantBrut) {
    telephone = body.telephone_eleve || body.telephone;
    const montantStr = String(montantBrut);
    if (/[A-Za-z]/.test(montantStr)) {
      // montant contient un SMS complet
      console.log('📩 montant traité comme SMS brut :', montantStr);
      montantNum = extraireMontant(montantStr);
    } else {
      montantNum = parseInt(montantStr.replace(/\D/g, '')) || 0;
    }
  }
  // Cas 2 : SMS brut dans body.texte ou body.message
  else if (body.texte || body.message) {
    const sms = body.texte || body.message;
    console.log('📩 SMS brut reçu :', sms);
    montantNum = extraireMontant(sms);
    telephone  = extraireTel(sms);
  }
  else {
    return res.status(400).json({ error: 'Données manquantes : telephone+montant ou texte SMS requis' });
  }

  if (!telephone) {
    return res.status(400).json({ error: 'Numéro de téléphone introuvable' });
  }

  // Déterminer le forfait selon le montant (plage pour absorber les frais)
  let forfait = null;
  if      (montantNum >= 500  && montantNum <= 599)  forfait = 'mensuel';
  else if (montantNum >= 1200 && montantNum <= 1299) forfait = 'trimestriel';
  else if (montantNum >= 4000 && montantNum <= 4099) forfait = 'annuel';

  if (!forfait) {
    console.warn(`⚠️ Montant non reconnu : ${montantNum} FCFA — SMS:`, body.texte || body.message || montantBrut);
    return res.status(400).json({ error: 'Montant non reconnu', montant_recu: montantNum });
  }

  const tel    = normaliserTel(telephone);
  const expiry = new Date(Date.now() + FORFAITS[forfait].jours * 86400000);
  abonnes.set(tel, { forfait, expiry, source: 'sms' });
  sauvegarder();

  console.log(`✅ SMS Paiement : ${tel} → ${forfait} → ${expiry.toISOString()}`);
  res.json({ success: true, forfait, expiry });
});
// ==========================================
// Vérification accès élève
app.get('/verifier-acces', (req, res) => {
  const tel = normaliserTel(req.query.tel || '');
  if (!tel) return res.json({ acces: false });
  const sub = abonnes.get(tel);
  if (!sub) return res.json({ acces: false });
  if (new Date() > new Date(sub.expiry)) { abonnes.delete(tel); sauvegarder(); return res.json({ acces: false }); }
  res.json({ acces: true, forfait: sub.forfait, expiry: sub.expiry });
});

// Dashboard admin
app.get('/api/admin/stats', (req, res) => {
  if (req.query.key !== ADMIN_KEY)
    return res.status(401).json({ error: 'Clé invalide' });
  const now  = new Date();
  const list = [];
  let revenus = 0;
  let purge = false;
  for (const [tel, sub] of abonnes.entries()) {
    if (new Date(sub.expiry) < now) { abonnes.delete(tel); purge = true; continue; }
    const jours_restants = Math.ceil((new Date(sub.expiry) - now) / 86400000);
    list.push({ telephone: tel, forfait: sub.forfait, expiry: sub.expiry, jours_restants });
    revenus += FORFAITS[sub.forfait]?.prix || 0;
  }
  if (purge) sauvegarder();
  res.json({
    abonnes: list,
    total_abonnes: list.length,
    revenus_estimes: revenus
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ping toutes les 10 minutes pour éviter la mise en veille (Render free tier)
const PING_URL = 'https://educi-qstl.onrender.com/verifier-acces?tel=ping';
setInterval(async () => {
  try {
    await fetch(PING_URL);
    console.log('Ping serveur OK');
  } catch(e) {
    console.error('Ping échoué:', e.message);
  }
}, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`EduCI server running on port ${PORT}`);
});

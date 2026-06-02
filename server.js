 const express = require('express');
const path = require('path');
const fs   = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

const SYSTEM_PROMPT = `Tu es le Professeur IA d'EduCI, application educative ivoirienne. Tu aides les eleves du secondaire (3ème, Terminale A, C et D) à comprendre leurs cours.

REGLES IMPORTANTES :
- Explique clairement et simplement selon le niveau de l'eleve
- Utilise des exemples concrets tires du quotidien ivoirien
- Pour les formules mathematiques, physique et chimie : ecris-les en texte simple et lisible
  Exemple : "F = m x a" au lieu de code LaTeX
  Exemple : "E = AN/AC" pour les fractions geometriques
  Exemple : "E = 1/2 x m x v2" pour l'energie cinetique
- Pour la SVT : decris clairement les schemas et figures en texte
- Encourage toujours l'eleve
- Reponds en francais clair et simple`;

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

const SUPPORT_PROMPT = `Tu es le professeur IA d'EduCI, plateforme éducative ivoirienne. Tu aides les élèves du secondaire en Côte d'Ivoire suivant les programmes DPFC officiels. Tu réponds en français, de façon claire, simple et encourageante. Tu t'adaptes au niveau de l'élève selon sa classe.`;

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
  const body = req.body;
  console.log('📦 Body reçu complet :', JSON.stringify(body));

  let telephone = null;
  let montantNum = 0;

  // Cas 1 : body structuré avec telephone + forfait + montant
  if ((body.telephone || body.telephone_eleve) && body.montant) {
    telephone = body.telephone_eleve || body.telephone;
    const montantStr = String(body.montant);
    // Si montant ressemble à un SMS brut plutôt qu'un nombre, extraire avec regex
    if (/[A-Za-z]/.test(montantStr)) {
      console.log('📩 montant traité comme SMS brut :', montantStr);
      const montantMatch = montantStr.match(/(\d[\d\s]*)\s*F(?:\s?CFA)?(?:\s|$)/i);
      montantNum = montantMatch ? parseInt(montantMatch[1].replace(/\s/g, '')) : 0;
    } else {
      montantNum = parseInt(montantStr.replace(/\D/g, '')) || 0;
    }
  }
  // Cas 2 : SMS brut Orange Money / Wave dans body.texte ou body.message
  else if (body.texte || body.message) {
    const sms = body.texte || body.message;
    console.log('📩 SMS brut reçu :', sms);

    // Extraire le montant (ex: "500 FCFA", "1 200 F CFA", "4000F")
    const montantMatch = sms.match(/(\d[\d\s]*)\s*F(?:\s?CFA)?(?:\s|$)/i);
    montantNum = montantMatch ? parseInt(montantMatch[1].replace(/\s/g, '')) : 0;

    // Extraire le numéro ivoirien (07xxxxxxxx / 05xxxxxxxx / 01xxxxxxxx)
    const telMatch = sms.match(/(?:225)?([05701]\d{8})/);
    telephone = telMatch ? telMatch[1] : null;
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
    console.warn(`⚠️ Montant non reconnu : ${montantNum} FCFA — SMS:`, body.texte || body.message || body.montant);
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

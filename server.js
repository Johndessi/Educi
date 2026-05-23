const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Routes PWA statiques (avant tout le reste) ──────────────────────────────
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
// ────────────────────────────────────────────────────────────────────────────

app.use(express.static(__dirname));

const SYSTEM_PROMPT = `Tu es le Professeur IA d'EduCI, application educative ivoirienne. Tu aides les eleves du secondaire ivoirien (6eme, 5eme, 4eme, 3eme, 2nde, 1ere, Terminale A, C, D) selon le programme officiel DPFC de Cote d'Ivoire.

REGLES IMPORTANTES :
- Explique clairement et simplement selon le niveau de l'eleve
- Utilise des exemples concrets tires du quotidien ivoirien
- Pour les formules mathematiques, physique et chimie : ecris-les en texte simple et lisible
  Exemple : "F = m x a" au lieu de code LaTeX
  Exemple : "AM/AB = AN/AC" pour les fractions geometriques
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

// === ABONNEMENTS CINETPAY ===
const ADMIN_KEY = process.env.ADMIN_KEY || 'EDUCI_ADMIN_2026';
const abonnes = new Map();
const FORFAITS = {
  mensuel:     { prix: 500,  jours: 30,  label: '1 mois'  },
  trimestriel: { prix: 1200, jours: 90,  label: '3 mois'  },
  annuel:      { prix: 4000, jours: 365, label: '1 an'    }
};

app.post('/initier-paiement', async (req, res) => {
  if (!process.env.CINETPAY_API_KEY)
    return res.status(503).json({ error: 'Paiement temporairement indisponible. Réessaie dans quelques heures.' });
  const { telephone, forfait } = req.body;
  if (!telephone || !FORFAITS[forfait])
    return res.status(400).json({ error: 'Données invalides' });
  const f = FORFAITS[forfait];
  const transactionId = `EDUCI-${Date.now()}-${telephone.replace(/\D/g,'').slice(-4)}`;
  try {
    const r = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:                  process.env.CINETPAY_API_KEY,
        site_id:                 process.env.CINETPAY_SITE_ID,
        transaction_id:          transactionId,
        amount:                  f.prix,
        currency:                'XOF',
        description:             `Abonnement EduCI — ${f.label}`,
        notify_url:              'https://educi-qstl.onrender.com/webhook-cinetpay',
        return_url:              `https://educi-qstl.onrender.com/?tel=${encodeURIComponent(telephone)}&statut=retour`,
        customer_phone_number:   telephone,
        customer_name:           'Eleve',
        customer_surname:        'EduCI',
        customer_email:          'eleve@educi.ci',
        customer_address:        'Abidjan',
        customer_city:           'Abidjan',
        customer_country:        'CI',
        customer_zip_code:       '00225',
        metadata:                JSON.stringify({ telephone, forfait }),
        lang:                    'fr',
        channels:                'ALL'
      })
    });
    const data = await r.json();
    if (data.code === '201') return res.json({ url_paiement: data.data.payment_url });
    res.status(400).json({ error: 'Paiement impossible. Vérifie ton numéro et réessaie.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook-cinetpay', async (req, res) => {
  res.sendStatus(200);
  const { cpm_trans_id } = req.body;
  if (!cpm_trans_id) return;
  try {
    const r = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:         process.env.CINETPAY_API_KEY,
        site_id:        process.env.CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id
      })
    });
    const data = await r.json();
    if (data.code === '00' && data.data?.cpm_result === '00') {
      let meta = {};
      try { meta = JSON.parse(data.data.cpm_custom || data.data.metadata || '{}'); } catch(_) {}
      const { telephone, forfait } = meta;
      if (telephone && FORFAITS[forfait]) {
        const expiry = new Date(Date.now() + FORFAITS[forfait].jours * 86400000);
        abonnes.set(telephone.replace(/\D/g,''), { forfait, expiry });
        console.log(`✅ Abonnement activé : ${telephone} — ${forfait} → ${expiry.toISOString()}`);
      }
    }
  } catch (err) { console.error('Webhook error:', err.message); }
});

app.get('/verifier-acces', (req, res) => {
  const tel = (req.query.tel || '').replace(/\D/g,'');
  if (!tel) return res.json({ acces: false });
  const sub = abonnes.get(tel);
  if (!sub) return res.json({ acces: false });
  if (new Date() > new Date(sub.expiry)) { abonnes.delete(tel); return res.json({ acces: false }); }
  res.json({ acces: true, forfait: sub.forfait, expiry: sub.expiry });
});

app.get('/api/admin/stats', (req, res) => {
  if (req.query.key !== ADMIN_KEY)
    return res.status(401).json({ error: 'Clé invalide' });
  const now = new Date();
  const list = [];
  let revenus = 0;
  for (const [tel, sub] of abonnes.entries()) {
    if (new Date(sub.expiry) < now) { abonnes.delete(tel); continue; }
    const jours_restants = Math.ceil((new Date(sub.expiry) - now) / 86400000);
    list.push({ telephone: tel, forfait: sub.forfait, expiry: sub.expiry, jours_restants });
    revenus += FORFAITS[sub.forfait]?.prix || 0;
  }
  res.json({
    abonnes: list,
    total_abonnes: list.length,
    revenus_estimes: revenus
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EduCI server running on port ${PORT}`);
});

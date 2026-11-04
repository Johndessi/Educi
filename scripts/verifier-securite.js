// Vérifie la sécurité de server.js : fichiers exposés, clés admin, secrets obligatoires.
// Usage : node scripts/verifier-securite.js   (code de sortie 1 si un contrôle échoue)
// Les secrets utilisés sont générés aléatoirement à chaque lancement et ne sont jamais affichés.
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const FAUX_ADMIN = crypto.randomBytes(24).toString('hex');
const FAUX_SMS = crypto.randomBytes(24).toString('hex');
let echecs = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) echecs++; };

// Environnement propre : aucune variable héritée ne doit fausser les contrôles
function env(extra) {
  const e = { ...process.env };
  for (const k of ['ADMIN_KEY', 'SMS_WEBHOOK_SECRET', 'RENDER', 'NODE_ENV', 'MONGODB_URI', 'ANTHROPIC_API_KEY']) delete e[k];
  return { ...e, ...extra };
}

const portLibre = () => new Promise(res => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });

// Démarre server.js ; résout quand il écoute, ou quand il s'arrête (code de sortie)
function demarrer(extraEnv) {
  return new Promise(resolve => {
    const proc = spawn(process.execPath, ['server.js'], { cwd: RACINE, env: env(extraEnv) });
    let sortie = '';
    const fin = r => { clearTimeout(t); resolve({ proc, sortie: () => sortie, ...r }); };
    proc.stdout.on('data', d => { sortie += d; if (/running on port/.test(sortie)) fin({ demarre: true }); });
    proc.stderr.on('data', d => { sortie += d; });
    proc.on('exit', code => fin({ demarre: false, code }));
    const t = setTimeout(() => fin({ demarre: false, code: 'délai' }), 15000);
  });
}
const arreter = s => new Promise(r => { if (s.proc.exitCode !== null) return r(); s.proc.on('exit', r); s.proc.kill(); });

async function requete(base, chemin, { methode = 'GET', entetes = {}, corps } = {}) {
  const r = await fetch(base + chemin, {
    method: methode, headers: { 'Content-Type': 'application/json', ...entetes },
    body: corps === undefined ? undefined : JSON.stringify(corps), signal: AbortSignal.timeout(20000),
  });
  await r.arrayBuffer();
  return r.status;
}

(async () => {
  // Fichiers publics attendus : déduits de manifest.json et de la liste de précache de sw.js
  const manifest = JSON.parse(fs.readFileSync(path.join(RACINE, 'manifest.json'), 'utf8'));
  const precache = JSON.parse(/PRECACHE\s*=\s*(\[[^\]]*\])/.exec(fs.readFileSync(path.join(RACINE, 'sw.js'), 'utf8'))[1].replace(/'/g, '"'));
  const icones = [...new Set(manifest.icons.map(i => i.src))];
  const publics = [...new Set(['/', '/index.html', '/sw.js', '/manifest.json', '/.well-known/assetlinks.json', '/confidentialite', '/admin', ...precache, ...icones])];
  const prives = ['/server.js', '/package.json', '/package-lock.json', '/.git/config', '/.git/HEAD', '/.env', '/.gitignore',
    '/scripts/verifier-securite.js', '/scripts/verifier-maths-2026.js', '/test/sous-titre-lecon.test.js',
    '/node_modules/express/package.json', '/node_modules/express', '/LGPLLR-ATTRIBUTION.md', '/abonnements.json',
    '/suggestions.json', '/confidentialite.html', '/icons/inexistant.png', '/%2e%2e/server.js', '/icons/../server.js'];

  // 1. Serveur avec secrets factices
  const port = await portLibre();
  const base = `http://127.0.0.1:${port}`;
  const s = await demarrer({ PORT: String(port), ADMIN_KEY: FAUX_ADMIN, SMS_WEBHOOK_SECRET: FAUX_SMS });
  ok(s.demarre, 'démarrage local avec ADMIN_KEY et SMS_WEBHOOK_SECRET');
  if (!s.demarre) { console.log(s.sortie()); process.exit(1); }

  console.log('\n— Fichiers publics (200 attendu)');
  for (const p of publics) { const st = await requete(base, p); ok(st === 200, `${st} ${p}`); }
  console.log('\n— Fichiers internes (404 attendu)');
  for (const p of prives) { const st = await requete(base, p); ok(st === 404, `${st} ${p}`); }

  console.log('\n— Routes admin');
  const mauvaise = crypto.randomBytes(24).toString('hex');
  const routes = [
    ['GET', '/api/admin/stats'],
    ['POST', '/api/admin/reset-appareils', {}],
    ['GET', '/api/suggestions'],
    ['PATCH', '/api/suggestions/inexistante', { statut: 'invalide' }],
  ];
  const cas = [];
  for (const [m, r, corps] of routes) {
    cas.push([`${m} ${r} sans clé`, requete(base, r, { methode: m, corps }), st => st === 401]);
    cas.push([`${m} ${r} mauvaise clé (?key=)`, requete(base, `${r}?key=${mauvaise}`, { methode: m, corps }), st => st === 401]);
    cas.push([`${m} ${r} mauvaise clé (x-admin-key)`, requete(base, r, { methode: m, corps, entetes: { 'x-admin-key': mauvaise } }), st => st === 401]);
    cas.push([`${m} ${r} bonne clé (?key=)`, requete(base, `${r}?key=${FAUX_ADMIN}`, { methode: m, corps }), st => st !== 401 && st !== 503]);
    cas.push([`${m} ${r} bonne clé (x-admin-key)`, requete(base, r, { methode: m, corps, entetes: { 'x-admin-key': FAUX_ADMIN } }), st => st !== 401 && st !== 503]);
  }
  // Exécutées en parallèle : sans MongoDB, les routes qui lisent la base attendent ~10 s avant de répondre 500
  for (const [nom, p, attendu] of cas) {
    const st = await p.catch(e => 'erreur ' + e.name);
    ok(attendu(st), `${st} ${nom}${st === 500 ? ' (clé acceptée ; 500 = pas de MongoDB en local)' : ''}`);
  }
  await arreter(s);
  ok(!s.sortie().includes(FAUX_ADMIN) && !s.sortie().includes(FAUX_SMS), 'aucun secret dans les logs du serveur');

  // 2. Local sans secrets : démarrage autorisé, routes concernées en 503
  console.log('\n— Local sans ADMIN_KEY ni SMS_WEBHOOK_SECRET');
  const port2 = await portLibre();
  const s2 = await demarrer({ PORT: String(port2) });
  ok(s2.demarre, 'démarrage local autorisé');
  if (s2.demarre) {
    const b2 = `http://127.0.0.1:${port2}`;
    ok(await requete(b2, '/api/admin/stats?key=x') === 503, 'route admin → 503');
    ok(await requete(b2, '/webhook-sms', { methode: 'POST', corps: {} }) === 503, 'webhook SMS → 503');
    ok(await requete(b2, '/') === 200, 'page d\'accueil toujours servie');
    await arreter(s2);
  }

  // 3. Production sans secrets : démarrage refusé
  console.log('\n— Production sans secrets (démarrage refusé attendu)');
  for (const [nom, extra, attendus] of [
    ['RENDER défini, aucun secret', { RENDER: 'true' }, ['ADMIN_KEY', 'SMS_WEBHOOK_SECRET']],
    ['NODE_ENV=production, aucun secret', { NODE_ENV: 'production' }, ['ADMIN_KEY', 'SMS_WEBHOOK_SECRET']],
    ['RENDER défini, ADMIN_KEY seule', { RENDER: 'true', ADMIN_KEY: FAUX_ADMIN }, ['SMS_WEBHOOK_SECRET']],
    ['RENDER défini, SMS_WEBHOOK_SECRET seul', { RENDER: 'true', SMS_WEBHOOK_SECRET: FAUX_SMS }, ['ADMIN_KEY']],
  ]) {
    const p = await demarrer({ PORT: String(await portLibre()), ...extra });
    const msg = p.sortie();
    ok(!p.demarre && p.code === 1 && /Démarrage refusé/.test(msg) && attendus.every(n => msg.includes(n)),
      `${nom} → ${p.demarre ? 'DÉMARRÉ' : 'refusé, code ' + p.code}, variables citées : ${attendus.join(', ')}`);
    ok(!msg.includes(FAUX_ADMIN) && !msg.includes(FAUX_SMS), `${nom} → aucun secret dans le message`);
    if (p.demarre) await arreter(p);
  }
  const p = await demarrer({ PORT: String(await portLibre()), RENDER: 'true', ADMIN_KEY: FAUX_ADMIN, SMS_WEBHOOK_SECRET: FAUX_SMS });
  ok(p.demarre, 'RENDER défini avec les deux secrets → démarrage autorisé');
  if (p.demarre) await arreter(p);

  console.log(`\n${echecs ? `✗ ${echecs} contrôle(s) en échec` : '✓ tous les contrôles sont passés'}`);
  process.exitCode = echecs ? 1 : 0;
})().catch(e => { console.error('Erreur du script :', e); process.exit(1); });

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const APC_SYSTEM = `Tu es le Professeur IA d'EduCI, application educative ivoirienne. Tu enseignes selon l'Approche Par les Competences (APC) du programme officiel DPFC de Cote d'Ivoire.

PEDAGOGIE APC :
- Pars toujours d'une SITUATION DE VIE reelle en Cote d'Ivoire
- Identifie la COMPETENCE visee
- Distingue les RESSOURCES : savoirs, savoir-faire, savoir-etre
- Utilise des exemples du quotidien ivoirien

FORMAT :
- Situation declenchante ivoirienne
- Competence visee
- Explication claire et progressive
- Exemple concret ivoirien
- Ce qu'il faut retenir

Langue : francais clair et simple.`;

app.post('/api/claude', async (req, res) => {
  try {
      const body = {
            ...req.body,
                  model: 'claude-haiku-4-5-20251001',
                        max_tokens: req.body.max_tokens || 1024,
                              system: APC_SYSTEM
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

                                                                                                                      app.get('*', (req, res) => {
                                                                                                                        res.sendFile(path.join(__dirname, 'index.html'));
                                                                                                                        });

                                                                                                                        app.listen(PORT, () => {
                                                                                                                          console.log(`EduCI server running on port ${PORT}`);
                                                                                                                          });
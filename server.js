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
9. La signature

=== DISSERTATION LITTÉRAIRE — Terminale A/D ===
Définition : exercice de réflexion argumentée sur une citation ou opinion littéraire, s'appuyant exclusivement sur des œuvres littéraires.

ANALYSE DU SUJET :
- Sujet avec citation → Information (la citation) + Consigne (la tâche).
- Sujet sans citation → consigne enchâssée, débute par "Dans quelle mesure".
- Mots-clés : identifier, définir, reformuler la thèse.
- Problématique : D'abord (de quoi parle la thèse ?) → Ensuite (point de vue auteur ?) → Enfin (point de vue différent ?).

TYPES DE PLANS :
- Plan inventaire : Expliquez / Justifiez / Montrez / Commentez → argumenter uniquement en faveur.
- Plan dialectique : Expliquez et discutez / Appréciez / Partagez-vous / Peut-on dire… → THÈSE + ANTITHÈSE.

PARAGRAPHE ARGUMENTATIF : Énoncé → Explication → Illustration (œuvre littéraire) → Conclusion partielle + annonce suivant.

TRANSITION : bilan partiel de la thèse + question rhétorique annonçant l'antithèse.

INTRODUCTION (4 parties) :
1. Perspective générale (analogie / contraste / définition)
2. Insertion + reformulation de la thèse
3. Problématique (questions)
4. Annonce du plan

CONCLUSION (3 parties) :
1. Bilan (synthèse du développement)
2. Point de vue personnel (réponse à la problématique)
3. Ouverture (fait actuel, autre genre ou œuvre)

ŒUVRES DE RÉFÉRENCE : La grève des Battù (Sow Fall), Les soleils des indépendances (Kourouma), Kaïdara (Hampâté Bâ), Soundjata (Djibril Tamsir Niane), Chants d'ombre (Senghor), D'éclairs et de foudres (Adiaffi), Les fleurs du mal (Baudelaire), Les Contemplations (Victor Hugo).
=== FIN DISSERTATION LITTÉRAIRE ===

---
### TERMINALE – FRANÇAIS – LEÇON 3 : QUESTIONS + RÉSUMÉ + PRODUCTION ÉCRITE (Toutes séries)
Fiche officielle DPFC – M. ZOGBE Jean Laurent

**Situation d'apprentissage :** Des élèves de Terminale reçoivent une brochure de textes argumentatifs (~700 mots). Ils doivent : répondre aux questions, résumer le texte au quart de son volume, et rédiger une production écrite argumentée.

#### SÉANCE 1 – Réponses aux questions / consignes
- Identifier, analyser et répondre aux questions de compréhension et de vocabulaire portant sur le texte support.
- Exemple texte 1 (RIFKIN) : thème = tourisme/voyage ; thèse = malgré les reproches, le tourisme est facteur de rencontre entre les peuples ; griefs = exploitation commerciale, dévalorisation culturelle, expropriation des indigènes.
- Synonyme « envergure » → dimension, importance.

#### SÉANCE 2 – Identification de la situation d'argumentation
Éléments à identifier dans un texte argumentatif :
1. **Le thème** : sujet principal abordé (ex : le tourisme et le voyage)
2. **Le champ lexical** : ensemble des mots renvoyant au thème
3. **Les indices personnels** : pronoms (« nos », « on », « il », « leur(s) ») ; temps verbaux dominants (présent, imparfait, passé composé, participe présent)
4. **La thèse** : point de vue défendu par l'auteur (ex : le tourisme demeure un facteur de rencontre malgré ses défauts)
5. **Les connecteurs logiques et leurs valeurs** : « et » = addition ; « mais » = opposition ; « Ce n'est pas pour rien que » = concession ; « puis » = addition ; « aussi » = conséquence ; « par exemple » = illustration ; « enfin » = conclusion/énumération
6. **La structure du texte** : identifier les séquences et leurs titres par paragraphe
7. **La visée argumentative** : ce que l'auteur veut faire comprendre au lecteur

#### SÉANCE 3 – Sélection des idées essentielles
**Définition :** La sélection des idées essentielles impose un « toilettage » du texte : supprimer les exemples illustratifs, digressions, parenthèses, insistances, citations, expansions, répétitions, énumérations, questions.
**Méthode :** Pour chaque paragraphe (ou groupe de paragraphes), formuler en une phrase l'idée principale.
Exemple (texte RIFKIN, 11 idées essentielles) :
- Id1 : L'industrie du voyage et du tourisme est le premier secteur économique mondial.
- Id2 : L'idée de voyage remonte à l'Antiquité mais voyager par divertissement était rare.
- Id3 : La révolution industrielle et le rail ont rendu le voyage collectif courant.
- Id4 : Le secteur s'est envolé avec l'avènement des voyages aériens bon marché.
- Id5 : Des critiques postmodernes soutiennent que tourisme et voyage ont un effet opposé.
- Id6 : Ils transforment l'expérience en exploitation commerciale.
- Id7 : La culture indigène se banalise et se dégrade.
- Id8 : Les populations indigènes sont parfois exclues de leurs propres patrimoines.
- Id9 : Malgré ces réserves, le contact avec d'autres cultures reste une expérience éclairante.
- Id10 : Le tourisme est source d'emploi et de découverte de l'autre pour les populations locales.
- Id11 : La prolifération des voyages crée une humanité plus unie.

#### SÉANCE 4 – Reformulation des idées essentielles
**Définition :** Reformuler = dire autrement ce qui est dit, sans s'éloigner de l'idée de l'auteur, en variant le vocabulaire (synonymes, termes génériques, transformation de phrases complexes en simples).
Exemples de reformulations (texte RIFKIN) :
- Id1 reformulée : L'industrie du voyage et du tourisme occupe une place prépondérante dans l'économie mondiale.
- Id2 reformulée : Car à l'origine, l'on ne voyageait que dans le cadre du travail.
- Id3 reformulée : En effet, grâce au développement du transport au XIXe siècle, le voyage terrestre a pris un essor considérable.
- Id4 reformulée : Cet essor s'est étendu aujourd'hui au secteur aérien.
- Id5 reformulée : C'est pourquoi les postmodernes s'opposent au voyage et au tourisme.
- Id6 reformulée : Ils reprochent au tourisme son caractère mercantile à des fins de luxure.
- Id7 reformulée : L'industrie du tourisme dévalorise la culture indigène.
- Id8 reformulée : Des patrimoines achetés à des fins touristiques sont interdits d'accès aux locaux.
- Id9 reformulée : Bien que ces griefs soient justes, le tourisme demeure un facteur de rencontre, d'échange culturel, de compréhension mutuelle et d'empathie.
- Id10 reformulée : Il est à la fois pour les populations locales pourvoyeur d'emploi et facteur de découverte de l'autre.
- Id11 reformulée : Enfin, le développement de l'industrie du voyage et du tourisme renforce davantage les liens entre les hommes.

#### SÉANCE 5 – Rédaction du résumé
**Règles fondamentales :**
- Le résumé se présente en UN SEUL BLOC (pas d'introduction, pas de développement, pas de conclusion distincts).
- Volume = 1/4 du texte original ± 10% de tolérance.
- Mentionner le nombre de mots en bas du résumé (ne pas inventer).
- Utiliser les idées reformulées reliées par des connecteurs logiques équivalents.
- Résumé modèle du texte RIFKIN (153 mots) : L'industrie du voyage et du tourisme occupe une place prépondérante dans l'économie mondiale. Car à l'origine, l'on ne voyageait que dans le cadre du travail. En effet, grâce au développement du transport au XIXe siècle, le voyage terrestre a pris un essor considérable. Cet essor s'est étendu aujourd'hui au secteur aérien. C'est pourquoi les postmodernes opposent le voyage et le tourisme. Ensuite, ils reprochent au tourisme son caractère mercantile à des fins de luxure. Du fait que l'industrie du tourisme dévalorise la culture indigène. Des patrimoines sont achetés à des fins touristiques puis interdits d'accès aux locaux. Bien que ces griefs soient justes, le tourisme demeure un facteur de rencontre, d'échange culturel, de compréhension mutuelle et d'empathie. Il est à la fois pour les populations locales pourvoyeur d'emploi et facteur de découverte de l'autre. Enfin, le développement de l'industrie du voyage et du tourisme renforce davantage les liens entre les hommes. (153 mots)

#### SÉANCES 7–11 – Production écrite (texte argumentatif)
**Définition :** La production écrite porte sur une citation extraite du texte support. Elle comporte deux parties : la consigne (étayer ou réfuter) et l'information (thèse + mots-clés).

**Étayer vs Réfuter :**
- Étayer = développer et appuyer la thèse de l'auteur avec des arguments et exemples nouveaux (synonymes : expliquer, soutenir, démontrer).
- Réfuter = rejeter la thèse de l'auteur avec des contre-arguments et contre-exemples (synonymes : infirmer, démentir, contester).

**Étapes de la production écrite :**
1. **Analyse du sujet** : identifier consigne + information ; analyser le verbe introducteur ; dégager thème, thèse et mots-clés.
2. **Recherche des idées** : trouver 3 à 4 arguments + exemples illustratifs.
3. **Organisation de l'argumentation** : hiérarchiser les idées, construire un plan cohérent.
4. **Rédaction d'un paragraphe argumentatif** : Annoncer l'argument → Expliquer → Illustrer → Conclure le paragraphe.
5. **Introduction** : phrase d'accroche (nom de l'auteur + source + citation entre guillemets) + annonce de la prise de position/plan.
6. **Conclusion** : bilan + ouverture (facultative).

**Structure d'un paragraphe argumentatif :**
Thèse → Argument (D'abord / Ensuite / En outre / Enfin) → Explication (Car / En effet / C'est pourquoi) → Exemple (Par exemple / Nous avons pour illustration) → Mini-conclusion ou transition.

**Production écrite modèle complète (texte RIFKIN) :**
Introduction : Dans son texte intitulé « Aujourd'hui, tout le monde est touriste », publié dans Une nouvelle conscience pour un monde en crise (éd. Nouveaux Horizons, avril 2011), Jérémy RIFKIN affirme que « la multiplication des voyages et des activités touristiques dans le monde est en train de créer de nouvelles relations humaines ». Nous étayerons ce point de vue à travers une argumentation.
Développement (4 arguments) :
- Arg1 : suppression des comportements antipathiques entre peuples / disparition du racisme et de l'ethnocentrisme.
- Arg2 : brassage des peuples / ouverture des frontières (ex. Amazonie, patrimoines UNESCO).
- Arg3 : échanges d'expériences, d'expertises et de savoirs scientifiques / salons et colloques internationaux.
- Arg4 : création d'activités commerciales génératrices de devises / hôtellerie, gastronomie, vente de produits locaux.
Conclusion : En somme, la multiplication des voyages et des activités touristiques travaille au bien-être de l'homme et au rapprochement des peuples. L'essor des médias et du numérique joue également un rôle déterminant dans ce phénomène.
---

=== 1ère – FRANÇAIS – COMMENTAIRE COMPOSÉ (Toutes séries) ===

I. DÉFINITION
Le commentaire composé est un exercice argumenté visant à mettre en valeur la qualité d'un texte, en faisant appel au fond (les idées) et à la forme (procédés grammaticaux, figures de style). Il révèle la signification profonde du texte au-delà de l'explicite.

II. ANALYSE DU LIBELLÉ
Le libellé comprend deux composantes :
1. La tâche : indique le type de travail demandé (ex. « Faites un commentaire composé de ce texte »).
2. Les centres d'intérêt (généralement deux) : indiquent les grandes orientations du développement. Chaque CI est un thème à exploiter en s'appuyant sur des indices textuels pertinents.

III. CONSTRUCTION DU SENS DU TEXTE
1. Type/nature du texte : récit, dialogue, discours, description, portrait, poème...
2. Tonalité : sentiment/impression dominant après lecture (pathétique, lyrique, réaliste, ironique...).
3. Thème : ce dont parle le texte.
4. Idée générale : ce que l'auteur dit à propos du thème, l'opinion développée.

IV. LES INDICES TEXTUELS
Éléments pertinents sélectionnés selon les centres d'intérêt pour être analysés et interprétés :
- Indices lexicaux (champs lexicaux)
- Procédés grammaticaux (types/formes de phrases, temps verbaux)
- Figures de style (comparaison, métaphore, antithèse, oxymore, personnification, hyperbole…)
Tous les indices ne sont pas forcément présents dans chaque texte.

V. ORGANISATION DES CENTRES D'INTÉRÊT
Identifier les CI dans l'ordre du libellé, répartir les indices textuels selon les CI, regrouper les interprétations convergentes en sous-thèmes (2 à 4 sous-parties par CI). Pour chaque sous-thème : repérer les citations, indiquer les techniques littéraires et leur interprétation sous forme de phrases nominales.

VI. RÉDACTION D'UN PARAGRAPHE ARGUMENTATIF
Composantes obligatoires :
1. Idée directrice (le sous-thème)
2. Explication du sous-thème
3. Illustration par un ou deux indices textuels du texte support
4. Conclusion du sous-thème + annonce du sous-thème suivant (transition)
Tout changement d'idée = nouveau paragraphe.

VII. RÉDACTION D'UN CENTRE D'INTÉRÊT
Commence par une phrase introductive annonçant le CI, puis enchaîne les paragraphes argumentatifs de chaque sous-thème avec des connecteurs logiques/organisateurs textuels pour assurer la cohérence.

VIII. L'INTRODUCTION (un seul paragraphe, 3 parties liées)
1. Contexte général/amorce : approche thématique, mouvement littéraire, contexte socio-historique, ou citation.
2. Présentation du texte : auteur (nom, époque, courant), œuvre (titre, genre, date), texte (nature, titre, tonalité), idée générale.
3. Annonce du plan : rappel des centres d'intérêt qui seront étudiés.

IX. LA CONCLUSION
1. Bilan du devoir : synthèse des centres d'intérêt traités.
2. Jugement critique : point de vue personnel sur le sujet/thème.
3. Ouverture : rapprochement avec un autre texte/œuvre traitant un thème similaire.

X. MÉTHODE GLOBALE DE RÉDACTION
Le commentaire composé se rédige sans dissocier le fond (les idées) de la forme (les procédés). Chaque indice textuel cité doit être immédiatement suivi de son interprétation reliée au sous-thème puis au centre d'intérêt.

=== FIN COMMENTAIRE COMPOSÉ 1ère ===

---
=== 1ère Toutes séries — Leçon 2 : Questions + Résumé + Production écrite ===

DÉFINITION
Le résumé de texte argumentatif (ou contraction de texte) consiste à réduire le volume initial d'un texte au 1/4 en se basant sur les idées essentielles, reformulées dans les mots de l'élève. L'exercice complet comprend trois parties : I. Questions de compréhension, II. Résumé, III. Production écrite (étayer ou réfuter une thèse).

I. QUESTIONS DE COMPRÉHENSION (4 points)
Identifier le thème, reformuler/identifier la thèse, dégager les problèmes ou la visée argumentative, expliquer en contexte une expression du texte. Les réponses doivent être justifiées par des références précises au texte (lignes citées) quand demandé.

II. RÉSUMÉ — MÉTHODOLOGIE EN 4 ÉTAPES
1. Identification de la situation d'argumentation : repérer le thème, la thèse, les indices d'énonciation (pronoms personnels — je/nous/on/vous/il —, temps verbaux dominants), les connecteurs logiques et leur valeur (addition, cause, conséquence, opposition, etc.), la structure du texte (découpage en séquences/paragraphes avec un titre par paragraphe), le champ lexical de la thèse, et la visée argumentative de l'auteur.
2. Sélection des idées essentielles et enchaînement logique : pour chaque paragraphe, extraire l'idée essentielle (souvent 1 à 2 par paragraphe), puis relier ces idées entre elles à l'aide de connecteurs logiques appropriés (en effet, en outre, cependant, aussi, mais, ainsi, car, etc.) qui respectent la logique argumentative du texte.
3. Reformulation : reformuler chaque idée essentielle avec un vocabulaire personnel (synonymes, termes génériques, transformation de phrases complexes en phrases simples), sans s'éloigner du sens voulu par l'auteur.
4. Rédaction du résumé final : le résumé se présente en UN SEUL BLOC, sans introduction, ni développement, ni conclusion séparés. Il doit respecter le quart du nombre de mots du texte original avec une marge de tolérance de ±10%, et indiquer le nombre de mots du résumé à la fin entre parenthèses. Ne jamais inventer un nombre de mots.

EXEMPLE DE RÉFÉRENCE (Texte support 1 "Du tourisme mondial", 599 mots → résumé attendu autour de 135-165 mots) :
"Les pays pauvres ont mis beaucoup d'espoir dans le développement du tourisme mondial dans les années 60. En effet, ils ont vu l'occasion pour s'enrichir. En outre, les gens se sont énormément déplacés. Cependant, la majorité des touristes sont issus des pays riches et cherchent à favoriser des échanges, surtout au niveau économique. Aussi, la publicité que font les spécialistes du secteur donne au pays pauvre une image de rêve qui contraste de la réalité. Mais, sur le plan social, ce tourisme n'offre pas d'emploi durable dans le tiers monde pauvre. Et sur le plan économique, ce tourisme nécessite de gros moyens et entraine la cherté de la vie. Ainsi, il y a lieu donc que cette forme de tourisme change. Car il est impérieux que les pays du tiers monde pauvre soient au centre de ce tourisme afin d'en bénéficier. (141 mots)"

III. PRODUCTION ÉCRITE — MÉTHODOLOGIE EN 5 ÉTAPES
1. Analyse du sujet : le sujet comporte deux parties — la consigne (verbe introducteur : "étayer" = développer/soutenir la thèse de l'auteur avec de nouveaux arguments et exemples ; "réfuter" = rejeter/contredire la thèse avec des contre-arguments) et l'information (la citation/thèse à traiter). Identifier le thème du sujet, la thèse, et reformuler la thèse avec d'autres mots.
2. Recherche des idées : trouver au moins 2 arguments en lien avec le thème et le point de vue à défendre (ou réfuter), chacun développé en quelques phrases.
3. Organisation de l'argumentation : classer les arguments dans un ordre logique (du plus simple au plus complexe, ou du plus général au plus spécifique) et associer un exemple concret à chaque argument.
4. Rédaction des paragraphes argumentatifs : chaque paragraphe doit comporter 4 composantes — annoncer l'argument (avec un connecteur : d'abord, en outre, enfin...), l'expliquer, l'illustrer par un ou deux exemples, et le conclure si nécessaire.
5. Rédaction de l'introduction et de la conclusion :
   - Introduction : phrase d'accroche obligatoire (nom de l'auteur + source/date de la citation + citation entre guillemets), suivie de l'annonce de la prise de position (étayer ou réfuter) à travers une argumentation.
   - Conclusion : un bilan (synthèse de l'argumentation développée) + une ouverture facultative (élargissement du débat).

EXEMPLE DE RÉFÉRENCE — INTRODUCTION : "Dans son texte intitulé 'Du tourisme mondial', publié dans Le Monde, paru le 20 septembre 1985, Ezzedine Mestiri affirme qu'« il est nécessaire de modifier les conditions du tourisme mondial. » Nous étayerons ce point de vue à travers une argumentation."

EXEMPLE DE RÉFÉRENCE — CONCLUSION : "De ce qui précède, nous retenons que sur le plan économique, ce tourisme nécessite de gros moyens et entraine la cherté de la vie. Il y a lieu donc que cette forme de tourisme change."

Quand un élève demande de l'aide sur cette leçon (1ère, Questions + Résumé + Production écrite), guide-le étape par étape selon cette méthodologie, en t'appuyant sur les exemples ci-dessus comme modèles de référence sans les recopier tels quels pour son propre texte.
=== FIN 1ère Leçon 2 : Questions + Résumé + Production écrite ===

---
=== 1ère Toutes séries — Leçon 3 : La dissertation littéraire ===

DÉFINITION
La dissertation littéraire est un exercice de réflexion sur une idée, une citation ou une opinion portant sur une problématique littéraire. Elle n'emprunte ses connaissances qu'au domaine de la littérature (œuvres, auteurs, courants, genres).

I. ANALYSE DU SUJET
1. Types de sujets :
   - Sujet AVEC citation : composé de l'information (la citation, le point de vue d'un auteur/critique) et de la consigne (les tâches à faire, indiquant le plan à suivre : expliquez, discutez, etc.)
   - Sujet SANS citation : la consigne est enchâssée dans l'information (ex : « Le personnage de roman donne au lecteur un accès privilégié à la connaissance du cœur humain. Dans quelle mesure ? »)
2. Éléments essentiels (mots-clés) : identifier et analyser le sens des mots-clés du sujet (ex : « littérature négro-africaine », « remise en cause », « remise en place »).
3. Reformulation du sujet : reprendre le sujet avec d'autres mots en gardant le sens (ex : « La littérature négro-africaine est une littérature qui critique, dénonce pour corriger. »)
4. La problématique : se poser 3 questions successives —
   - D'abord : de quoi parle le sujet ? Quel est le problème soulevé ? (le problème)
   - Ensuite : qu'en dit l'auteur ? Quel est son point de vue ? (la thèse)
   - Enfin : existe-t-il un point de vue différent ou opposé ? (l'antithèse)

II. RECHERCHE DES IDÉES
Interroger sa culture littéraire pour trouver des arguments soutenant la thèse, puis l'antithèse, et les illustrer systématiquement par des exemples précis tirés d'œuvres littéraires (africaines de préférence) lues ou étudiées. Chaque argument doit être accompagné d'au moins un exemple concret (titre de l'œuvre, auteur, élément précis de l'intrigue ou de la forme).

III. ÉLABORATION DU PLAN
1. Types de plans :
   - Plan inventaire/explicatif : argumentation pour expliquer le bien-fondé d'une affirmation. Mots-clés du libellé : expliquez, justifiez, montrez, commentez.
   - Plan dialectique : thèse (montrer la véracité de l'affirmation) + antithèse (montrer les limites/insuffisances). Mots-clés : appréciez, analysez, discutez, commentez et discutez, partagez-vous cette affirmation, approuvez-vous, que vous inspire…
2. Construction du plan : organiser arguments et exemples en paragraphes hiérarchisés avec transitions entre les parties.
3. Le paragraphe argumentatif comporte : énoncé de l'argument → explication → illustration par 1-2 exemples précis → conclusion de l'argument et annonce du suivant (connecteurs : d'abord, en outre, ensuite, enfin…).
4. La transition entre deux parties conclut la première ET annonce la deuxième (conclusion partielle + question ouvrant sur la suite).

IV. RÉDACTION DU DÉVELOPPEMENT
Structure pour un plan dialectique :
- Phrase introductive énonçant l'idée directrice de la 1ère partie (la thèse)
- 1er, 2e, 3e paragraphes argumentatifs (argument + 1-2 exemples chacun)
- Phrase conclusive et transitionnelle (bilan partiel + annonce de la 2e partie)
- Phrase introductive énonçant l'idée directrice de la 2e partie (l'antithèse)
- Paragraphes argumentatifs de la 2e partie
- Phrase conclusive de la 2e partie

EXEMPLE DE RÉFÉRENCE (paragraphe argumentatif) : « La littérature négro-africaine est un moyen de critique et de dénonciation de certaines pratiques telles que l'excision (énoncé). Celle-ci existe encore dans certaines contrées africaines (explication). Fatou Kéita en parle dans son œuvre Rebelle qui décrit les souffrances causées par les mutilations génitales pour inviter la société à mettre fin à cette pratique (illustration). Ceci, en vue d'amener les défenseurs de cette pratique à changer de comportement (conclusion de l'argument). »

V. RÉDACTION DE L'INTRODUCTION
Composantes :
1. Généralités/perspective générale : amener le sujet par analogie (idée voisine plus générale), par contraste (idée opposée), ou par une définition orientée.
2. Énoncé du sujet : reproduire la citation textuellement si courte, ou la reformuler avec ses expressions clés si longue.
3. La problématique : reprendre sous forme de questions les problèmes soulevés (peut servir d'annonce du plan).
4. Annonce du plan : présenter la démarche du développement.

EXEMPLE DE RÉFÉRENCE : « La question de la fonction de la littérature a toujours été diversement appréciée dans le monde littéraire. Si pour les uns, la littérature négro-africaine a une dimension purement ludique, didactique ou lyrique, pour les autres, elle est un combat, une lutte, un engagement. [Auteur cité] s'inscrit dans cette dernière vision en affirmant : "citation". Autrement dit, [reformulation]. Ainsi, le sujet pose ici le problème de [problème]. Dès lors, dans quelles mesures… ? N'aborde-t-elle pas aussi d'autres questions ? Telles sont les préoccupations auxquelles nous tenterons de répondre. »

VI. RÉDACTION DE LA CONCLUSION
Composantes (dans l'ordre) :
1. Le bilan : synthèse de ce qui a été démontré dans le développement.
2. Le jugement/point de vue personnel : avis personnel de l'élève répondant à la problématique.
3. L'ouverture (facultative) : mise en relation avec un fait actuel, un genre littéraire, une œuvre, ou une grande problématique littéraire.

Quand un élève demande de l'aide sur cette leçon (1ère, dissertation littéraire), guide-le étape par étape selon cette méthodologie, en l'aidant notamment à trouver des arguments et des exemples tirés d'œuvres littéraires africaines pertinentes pour son sujet, sans imposer systématiquement les exemples cités ci-dessus.
=== FIN 1ère Leçon 3 : La dissertation littéraire ===

---
=== 2nde Toutes séries — Leçon : Questions + Résumé + Production écrite ===

DÉFINITION
Le résumé de texte argumentatif comprend trois parties : I. Questions de compréhension, II. Résumé, III. Production écrite. Un texte argumentatif est un texte dans lequel l'auteur soutient, défend ou réfute une idée avec des arguments et des exemples.

I. QUESTIONS DE COMPRÉHENSION
Les questions portent sur : le système énonciatif (thème, thèse, antithèse, visée argumentative), l'organisation lexicale (expressions à expliquer en contexte) et l'organisation argumentative (structure du texte, connecteurs logiques). Les réponses doivent être correctement rédigées en phrases complètes.

II. RÉSUMÉ — MÉTHODOLOGIE EN 4 ÉTAPES

1. Identification de la situation d'argumentation : repérer
   - le thème (sujet principal du texte)
   - le champ lexical lié au thème (mots/groupes de mots renvoyant au thème)
   - la thèse (point de vue défendu par l'auteur)
   - le champ lexical lié à la thèse (les arguments qui la soutiennent)
   - la thèse contraire (l'opinion opposée à celle de l'auteur, si elle existe)
   - les indices d'énonciation (marques de personne « je »/« nous » = jugement personnel de l'auteur ; « il » = point de vue général)
   - la structure du texte (découpage en séquences argumentatives)
   - la visée argumentative (ce que l'auteur cherche à faire évoluer chez le lecteur : conception ou comportement)

2. Sélection des idées essentielles : "toiletter" le texte en éliminant ce qui est dispensable — exemples illustratifs, digressions, parenthèses, insistances, citations, expansions, répétitions, énumérations, questions, comparaisons/métaphores, chiffres, explications. Pour cela : identifier les connecteurs logiques qui structurent les séquences argumentatives, distinguer thèse/arguments/exemples, puis sélectionner une idée essentielle par paragraphe (parfois plusieurs).

3. Enchaînement logique entre les idées essentielles : relier les idées essentielles sélectionnées avec des connecteurs logiques équivalents à ceux du texte original, en respectant le schéma argumentatif.

4. Reformulation des idées essentielles : reformuler avec une expression personnelle en gardant le sens, en utilisant :
   - des synonymes ou équivalents (ex : "le système socio-économique" → "la société")
   - un adjectif à la place d'un complément du nom (ex : "de la société" → "social")
   - un adverbe à la place d'un groupe nominal prépositionnel (ex : "avec une grande rapidité" → "rapidement")
   - un adjectif à la place d'une proposition relative (ex : "les parents qui abandonnent leurs enfants" → "les parents coupables" ; "le village où je suis né" → "le village natal")
   - un mot englobant/générique à la place d'une énumération (ex : "à la vie, à l'éducation, à la nourriture, au logement" → "des droits" ; "la radio, la télévision, la presse écrite" → "les médias")
   - une phrase simple à la place d'une phrase complexe (ex : "Les élèves attendent que le professeur les félicite" → "Les élèves attendent la félicitation du professeur")
   - un signe de ponctuation à la place d'une subordination/connecteur (ex : "Étant donné la pluie diluvienne qui tombait, il ne sortit pas" → "Une pluie diluvienne tombait : il ne sortit pas")
   - un participe présent à la place d'une subordonnée circonstancielle (ex : "puisqu'elle était arrivée la première" → "étant la première")
   - une proposition infinitive à la place d'une subordonnée complétive (ex : "voyait que sa fin arrivait" → "voyait sa fin arriver")
   - un changement de nature du mot (ex : "réaménager" → "réaménagement") ou de voix du verbe (ex : "les résultats sont attendus par les élèves" → "les élèves attendent leurs résultats")
   IMPORTANT : il est interdit de reproduire la syntaxe du texte original — il faut la transformer radicalement.

5. Rédaction du résumé : à partir des idées reformulées, rédiger en respectant le schéma argumentatif de base, le quart (ou le tiers, selon la consigne) du volume initial, avec une marge de tolérance de ±10%, en un seul bloc, et indiquer le nombre de mots.

III. PRODUCTION ÉCRITE — MÉTHODOLOGIE
La production écrite est la partie "culturelle" du devoir : les arguments et exemples peuvent provenir de la culture personnelle de l'élève, pas uniquement des œuvres au programme.

1. Analyse du sujet : le sujet comporte une information (pensée/citation/thème/thèse/mots-clés) et une consigne. Trois verbes possibles :
   - Étayer : soutenir, montrer la véracité/le bien-fondé de l'affirmation
   - Réfuter : rejeter, s'opposer en montrant les insuffisances
   - Discuter : soutenir PUIS réfuter l'affirmation (plan dialectique)

2. Recherche des idées : trouver des arguments et exemples en variant les domaines (social, éducatif, économique, familial, conjugal, politique, sportif, sécuritaire, vestimentaire, intellectuel, etc.), chaque idée associée à un exemple concret.

3. Organisation de l'argumentation : classer les arguments et exemples de manière cohérente — c'est l'élaboration du plan du développement.

4. Le paragraphe argumentatif comprend : l'argument (l'idée), l'explication de l'argument, et l'exemple qui l'illustre.

5. Introduction (3 parties) :
   - Phrase d'accrochage : nom de l'auteur, titre de l'œuvre/du texte, source, date de publication
   - Insertion de la thèse à étayer/réfuter/discuter : annoncer la citation tirée du texte de base
   - Annonce du plan : la prise de position qui annonce le plan du devoir

6. Conclusion (2 parties) :
   - Le bilan : synthèse de ce qui a été développé
   - L'ouverture : élargir la citation pour son actualisation

EXEMPLE DE RÉFÉRENCE — INTRODUCTION : "Camille Jullian, dans une rubrique publiée dans Jeune Afrique de novembre 2008, affirme : « La délinquance juvénile n'est pas seulement un phénomène engendré par le système socio-économique mais aussi par la démission des parents. » Dans un développement argumenté et organisé, nous tenterons d'étayer le point de vue de l'auteur."

EXEMPLE DE RÉFÉRENCE — CONCLUSION : "Au terme de notre analyse, nous pouvons retenir que la délinquance juvénile constitue une préoccupation non seulement pour la société mais aussi pour les parents (bilan). L'État doit prendre des mesures adéquates pour enrayer ce phénomène (ouverture)."

Quand un élève de 2nde demande de l'aide sur cette leçon, guide-le étape par étape selon cette méthodologie, en l'aidant en particulier sur le "toilettage" du texte et les techniques de reformulation, qui sont les points les plus délicats à ce niveau.
=== FIN 2nde : Questions + Résumé + Production écrite ===

---
=== 2nde Toutes séries — Leçon 2 : Le commentaire composé (version partielle) ===

DÉFINITION
Le commentaire composé est un exercice argumenté visant à mettre en valeur la qualité d'un texte, en faisant appel au fond (les idées) ET à la forme (procédés grammaticaux, figures de style...). Il s'agit de révéler la signification profonde d'un texte en allant au-delà de l'explicite.

IMPORTANT — SPÉCIFICITÉ 2nde : contrairement à la 1ère et la Terminale où le commentaire composé est complet (introduction + 2 centres d'intérêt + conclusion), en 2nde le commentaire composé est PARTIEL : il se limite à l'introduction + UN SEUL centre d'intérêt (le premier indiqué dans le libellé). Pas de conclusion générale exigée à ce niveau, seulement une conclusion partielle/transition à la fin du centre d'intérêt traité.

I. ANALYSE DU LIBELLÉ
Le libellé comprend deux composantes :
1. La tâche : indique le type de travail (« Vous ferez de ce texte un commentaire composé »), généralement la première phrase.
2. Les centres d'intérêt : généralement deux, ils indiquent les grandes orientations du développement. Chaque CI est un thème à exploiter en s'appuyant sur les indices textuels pertinents. En 2nde, seul le premier centre d'intérêt sera développé.

II. CONSTRUCTION DU SENS DU TEXTE
1. Le type/la nature du texte : récit, dialogue, discours, description, portrait, poème...
2. La tonalité : le sentiment/l'impression dégagé par le texte (lyrique, pathétique, comique, tragique, épique...).
3. Le thème : ce dont parle le texte.
4. L'idée générale : ce que l'auteur dit à propos du thème, l'opinion qu'il développe.

III. LES INDICES TEXTUELS
Éléments pertinents du texte sélectionnés selon les centres d'intérêt, à analyser et interpréter : indices d'énonciation, indices lexicaux, procédés grammaticaux (types de phrases : nominale, impérative, déclarative...), figures de style (antithèse, énumération, métaphore, etc.). Tous ne sont pas forcément présents dans chaque texte.

IV. ORGANISATION DU CENTRE D'INTÉRÊT 1
1. Recherche des sous-titres : regrouper les indices textuels interprétés par proximité de sens pour dégager 3 à 4 sous-thèmes.
2. Plan détaillé — tableau à 4 colonnes pour le CI 1 :
   | Sous-titres | Repérages/indices textuels (Que dit l'auteur ?) | Analyses (Comment le dit-il ?) | Interprétations (Pourquoi le dit-il ?) |
3. Conclure par une phrase conclusive (bilan partiel) + transition annonçant (sans le développer) le second CI.

V. LE PARAGRAPHE ARGUMENTATIF
Chaque sous-titre devient un paragraphe comprenant :
- une idée directrice (le sous-thème = argument)
- l'explication du sous-thème
- l'illustration par un ou deux indices textuels (citations du texte support, jamais d'exemples extérieurs)
- la conclusion du sous-thème + annonce du sous-thème suivant
Tout changement d'idée = changement de paragraphe.

VI. RÉDACTION D'UN CENTRE D'INTÉRÊT
Phrase introductive annonçant le CI → paragraphes argumentatifs successifs (un par sous-titre) reliés par des connecteurs (d'abord, en outre, enfin...) → conclusion partielle (bilan) + transition vers le CI suivant.

VII. RÉDACTION DE L'INTRODUCTION
Un seul paragraphe, 3 parties liées :
1. Le contexte général/l'amorce : approche thématique, littéraire ou biographique.
2. La présentation du texte : auteur (nom, nationalité, époque), œuvre (titre, genre, date, maison d'édition), texte (nature, titre, tonalité, idée générale).
3. L'annonce du plan : rappel des centres d'intérêt (les deux peuvent être annoncés même si seul le premier est développé en 2nde).

EXEMPLE DE RÉFÉRENCE — INTRODUCTION : "Le phénomène des enfants de la rue, un fléau social, a maintes fois été dépeint par bon nombre d'écrivains de la seconde génération, parmi lesquels s'inscrit Sylvain Kean Zoh, écrivain ivoirien et auteur de Le printemps de la fleur fanée, œuvre parue en 2009 aux éditions NEI/CEDA. C'est cette œuvre qui abrite le texte soumis à notre étude. Dans ce récit à l'élan pathétique, l'auteur jette un regard rétrospectif sur sa vie d'enfant de la rue. Ainsi, sous la forme d'un commentaire composé, sans dissocier le fond de la forme, nous montrerons d'une part la marche épique du narrateur-personnage et d'autre part le bel avenir qu'il fait transparaître pour les enfants de la rue."

EXEMPLE DE RÉFÉRENCE — STRUCTURE CI 1 : phrase introductive → "D'abord, [sous-thème 1]..." (paragraphe avec citations et analyses) → "En outre, [sous-thème 2]..." → "Enfin, [sous-thème 3]..." → conclusion partielle ("Au regard de ce qui précède, nous pouvons dire que...") + transition vers le CI 2.

Quand un élève de 2nde demande de l'aide sur cette leçon, rappelle-lui systématiquement que le commentaire composé en 2nde se limite à l'introduction + le premier centre d'intérêt, et guide-le étape par étape : analyse du libellé → construction du sens → repérage et interprétation des indices textuels → organisation en sous-titres → rédaction.
=== FIN 2nde Leçon 2 : Le commentaire composé ===`;

const FICHES = [
  {
    id: "tle-fr-dissertation-litteraire",
    classe: "Terminale",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon 1 : La dissertation littéraire",
    seances: [
      {
        numero: 1,
        titre: "Analyse du sujet",
        habiletes: ["Identifier les différents types de sujets","Distinguer les deux parties de chaque sujet : l'information et la consigne","Analyser les mots-clés et leur sens","Reformuler chaque sujet","Dégager la problématique"],
        contenu: [
          { titre: "I. Définition", texte: "La dissertation littéraire est un exercice de réflexion sur une idée, une citation, une opinion portant sur une problématique littéraire. Elle n'emprunte ses connaissances qu'au seul domaine de la littérature." },
          { titre: "II. Analyse du sujet", texte: "1. Types de sujets :\na. Sujet avec citation : L'information (la citation/point de vue d'un auteur) + La consigne (les tâches à accomplir).\nb. Sujet sans citation : la consigne est enchâssée dans l'information ; débute généralement par « Dans quelle mesure ».\n\n2. Les mots-clés : les identifier et définir leur sens.\n\n3. Reformulation de la thèse : reprendre la thèse dans un autre langage en gardant le sens.\n\n4. La problématique : ensemble des problèmes dégagés du sujet. Démarche : D'abord (de quoi parle la thèse ?) → Ensuite (quel est le point de vue de l'auteur ?) → Enfin (existe-t-il un point de vue différent ?)." }
        ]
      },
      {
        numero: 2,
        titre: "Recherche des idées",
        habiletes: ["Identifier les composantes de chaque partie à rédiger","Rechercher les arguments et les illustrations pour la thèse et l'antithèse"],
        contenu: [
          { titre: "I. La recherche des idées", texte: "Activité consistant à interroger sa culture littéraire pour trouver les arguments qui soutiennent la thèse. Recenser les idées au brouillon et les illustrer avec des exemples précis tirés d'œuvres littéraires.\n\n1. La thèse : arguments + exemples qui approuvent l'affirmation de l'auteur.\n2. L'antithèse : arguments + exemples qui montrent les limites ou les autres aspects de l'affirmation." }
        ]
      },
      {
        numero: 3,
        titre: "Élaboration du plan",
        habiletes: ["Identifier les composantes de chaque partie","Rechercher arguments et illustrations","Construire les paragraphes argumentatifs et les transitions"],
        contenu: [
          { titre: "I. Les types de plans", texte: "1. Plan inventaire/explicatif : argumentation en faveur de la thèse uniquement. Mots-clés dans le libellé : Expliquez / Justifiez / Montrez / Commentez.\n\n2. Plan dialectique : deux parties — thèse (approuver) + antithèse (nuancer/limites). Mots-clés : Expliquez et discutez / Appréciez / Analysez / Partagez-vous / Peut-on dire… / Que vous inspire…" },
          { titre: "II. Construction du plan", texte: "1. Paragraphe argumentatif : Énoncé de l'argument → Explication → Illustration (1 ou 2 exemples d'œuvres littéraires) → Conclusion partielle + annonce de l'argument suivant.\n\n2. La transition : conclure la thèse par un bilan partiel + annoncer l'antithèse par une question rhétorique." }
        ]
      },
      {
        numero: 4,
        titre: "Rédaction d'une partie du développement",
        habiletes: ["Identifier les composantes de chaque partie","Énoncer l'argument","Expliquer l'argument","Illustrer avec un ou deux exemple(s)","Conclure le paragraphe"],
        contenu: [
          { titre: "I. Structure du développement", texte: "- Phrase introductive énonçant l'idée directrice de la thèse\n- 3 paragraphes argumentatifs (argument + explication + exemple + conclusion partielle)\n- Transition (bilan partiel + annonce de l'antithèse)\n- Phrase introductive énonçant l'idée directrice de l'antithèse\n- 3 paragraphes argumentatifs\n- Phrase conclusive de l'antithèse\n\nConnecteurs logiques utiles : D'abord / En effet / Cela se justifie dans… / Cependant / En outre / Au vu de ce qui précède…" }
        ]
      },
      {
        numero: 5,
        titre: "Rédaction d'une introduction et d'une conclusion",
        habiletes: ["Identifier les composantes de l'introduction et de la conclusion","Rédiger une introduction complète","Rédiger une conclusion complète"],
        contenu: [
          { titre: "I. Introduction (4 parties)", texte: "1. Perspective générale : amener le sujet dans un contexte général — par analogie (idée voisine), par contraste (idée opposée) ou par définition.\n2. Insertion + reformulation de la thèse : citer l'affirmation de l'auteur et la reformuler.\n3. Problématique : reprendre sous forme de questions les problèmes posés par le sujet.\n4. Annonce du plan : indiquer la démarche (thèse puis antithèse)." },
          { titre: "II. Conclusion (3 parties)", texte: "1. Bilan : synthèse de tout ce qui a été dit dans le développement.\n2. Point de vue personnel : appréciation et réponse claire à la problématique posée en introduction.\n3. Ouverture : mise en rapport avec un fait actuel, un genre littéraire, une autre œuvre ou une grande problématique littéraire." }
        ]
      },
      {
        numero: 6,
        titre: "Rédaction d'une dissertation littéraire partielle",
        habiletes: ["Introduire","Élaborer des paragraphes argumentatifs","Conclure","Appliquer toutes les techniques de la dissertation littéraire"],
        contenu: [
          { titre: "I. Rédaction partielle", texte: "Application complète : rédiger une dissertation intégrant introduction + développement (thèse + transition + antithèse) + conclusion. Respecter la structure complète avec connecteurs logiques, exemples littéraires précis et transitions soignées." }
        ]
      },
      {
        numero: 7,
        titre: "Remédiation",
        habiletes: ["Appliquer toutes les techniques de la dissertation littéraire sur un nouveau sujet","Corriger les erreurs identifiées lors des séances précédentes"],
        contenu: [
          { titre: "I. Remédiation — Sujet sur la poésie", texte: "Travail collectif sur un nouveau sujet. Démarche complète :\n1. Explication des mots-clés de la thèse\n2. Reformulation de la thèse\n3. Introduction (généralité → thèse → problématique → annonce du plan)\n4. Développement : thèse (3 arguments illustrés) + transition + antithèse (3 arguments illustrés)\n5. Conclusion (bilan + point de vue + ouverture)\n\nŒuvres africaines de référence : La grève des Battù (Sow Fall), Les soleils des indépendances (Kourouma), Kaïdara (Hampâté Bâ), Soundjata (Djibril Tamsir Niane), Chants d'ombre (Senghor), D'éclairs et de foudres (Adiaffi), Assémien Déhilé (Bernard Dadié)." }
        ]
      }
    ]
  },
  {
    id: "tle-fr-commentaire-compose",
    classe: "Terminale",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon 2 : Le commentaire composé",
    seances: [
      {
        numero: 1,
        titre: "Analyse du libellé et construction du sens du texte",
        habiletes: [
          "Identifier les différents centres d'intérêt",
          "Expliquer les centres d'intérêt",
          "Relever les indices textuels pertinents du texte",
          "Analyser leur(s) effet(s) de sens",
          "Construire le sens du texte"
        ],
        contenu: [
          {
            titre: "I. Définition",
            texte: "Le commentaire composé est un exercice argumenté visant à mettre en valeur la qualité d'un texte. Il faut faire appel au fond (les idées) et à la forme (procédés grammaticaux, figures de style…). C'est révéler la signification profonde en allant au-delà de l'explicite."
          },
          {
            titre: "II. Analyse du libellé",
            texte: "Le libellé comprend deux composantes :\n1. La tâche : elle indique le type de travail à faire (ex. : « Faites un commentaire composé de ce texte »).\n2. Les centres d'intérêt : ils indiquent les grandes orientations du développement. Chaque centre d'intérêt est un thème à exploiter à l'aide d'indices textuels (procédés grammaticaux, figures de style…)."
          },
          {
            titre: "III. Construction du sens du texte",
            texte: "1. Le type ou la nature du texte : récit, dialogue, discours, description, portrait, poème…\n2. La tonalité : sentiment ou impression ressenti après la lecture.\n3. Le thème : ce dont parle le texte.\n4. L'idée générale : ce que dit l'auteur à propos du thème."
          },
          {
            titre: "IV. Les indices textuels",
            texte: "Ce sont les éléments pertinents sélectionnés en fonction des centres d'intérêt. Types d'indices : lexicaux, procédés grammaticaux, figures de style, indices d'énonciation."
          }
        ]
      },
      {
        numero: 2,
        titre: "Organisation des centres d'intérêt",
        habiletes: [
          "Organiser les centres d'intérêt",
          "Élaborer le plan détaillé : titres, sous-titres, idées convergentes, moyens utilisés"
        ],
        contenu: [
          {
            titre: "I. Organisation des centres d'intérêt",
            texte: "Les indices textuels sont répartis selon les centres d'intérêt. Cette organisation se fait en plusieurs étapes :\n1. La recherche des sous-titres : regrouper les interprétations voisines pour dégager 2 à 3 sous-thèmes.\n2. Le plan détaillé : repérer les citations illustrant chaque CI, indiquer les techniques littéraires et leurs interprétations, regrouper les interprétations convergentes en sous-parties (2 minimum, 4 maximum)."
          }
        ]
      },
      {
        numero: 3,
        titre: "Rédaction d'un paragraphe",
        habiletes: [
          "Identifier les composantes d'un paragraphe de commentaire composé",
          "Identifier les éléments de transition entre paragraphes",
          "Identifier les éléments de transition entre le paragraphe et la conclusion partielle"
        ],
        contenu: [
          {
            titre: "I. Les composantes d'un paragraphe argumentatif",
            texte: "1. Une idée directrice (sous-thème) : argument développé dans un seul paragraphe.\n2. Explication du sous-thème : dire ce que l'idée signifie exactement.\n3. Illustration du sous-thème : un ou deux indices textuels tirés du texte support.\n4. Conclusion du sous-thème et annonce du suivant : reprendre l'idée développée et établir le lien avec le paragraphe suivant."
          },
          {
            titre: "II. Rédaction d'un paragraphe argumentatif",
            texte: "Exemple (CI 1, Texte 1) :\nLa vision de la femme traditionnelle s'observe à travers l'accomplissement du devoir familial/filial envers sa mère et la société et l'accomplissement du devoir conjugal envers son mari et la société.\nLes raisons de l'accomplissement du devoir familial se manifestent par : « Tu es donc toujours aussi rétive ! » et « Tu as donc définitivement décidée de m'humilier… » → phrases exclamative et déclarative traduisant l'injonction à la fille. De même, l'impératif dans « Viens, suis ta mère » impose et ordonne. Par le biais de ces analyses, la femme doit respecter l'autorité de sa mère et exécuter ses décisions."
          }
        ]
      },
      {
        numero: 4,
        titre: "Rédaction d'un centre d'intérêt",
        habiletes: [
          "Rédiger un centre d'intérêt complet avec phrase introductive, paragraphes et conclusion partielle"
        ],
        contenu: [
          {
            titre: "I. Définition",
            texte: "La rédaction du centre d'intérêt débute toujours par une phrase introductive annonçant le CI. Elle fait appel à des connecteurs logiques et organisateurs textuels pour assurer la cohérence entre les paragraphes."
          },
          {
            titre: "II. Rédaction d'un centre d'intérêt (exemple)",
            texte: "CI 1 – La vision de la femme traditionnelle :\nSous-thème 1 : accomplissement du devoir familial/filial.\nSous-thème 2 : accomplissement du devoir conjugal.\nConclusion partielle : « Pour tout dire, la femme traditionnelle est caractérisée par des valeurs morales qui la rendent digne et méritante que sont le respect et la soumission. Qu'en est-il de la vision de la femme moderne ? »"
          }
        ]
      },
      {
        numero: 5,
        titre: "Rédaction d'une introduction et d'une conclusion",
        habiletes: [
          "Rédiger l'introduction",
          "Rédiger la conclusion"
        ],
        contenu: [
          {
            titre: "I. L'introduction",
            texte: "Elle comprend trois parties rédigées en un seul paragraphe :\n1. Le contexte général (amorce) : approche thématique, mouvement littéraire, contexte social/politique, ou citation.\n2. La présentation du texte : auteur (nom, nationalité, époque), œuvre (titre, genre, date), texte (nature, tonalité), idée générale.\n3. L'annonce du plan : rappel des centres d'intérêt."
          },
          {
            titre: "II. La conclusion",
            texte: "Elle comprend trois parties :\n1. Bilan du devoir : synthèse des deux centres d'intérêt.\n2. Jugement critique : position personnelle sur le thème développé.\n3. Ouverture : rapprochement avec un autre texte traitant du même thème."
          }
        ]
      },
      {
        numero: 6,
        titre: "Rédaction du commentaire composé",
        habiletes: [
          "Rédiger le commentaire composé complet"
        ],
        contenu: [
          {
            titre: "I. Identification des parties du libellé",
            texte: "Le libellé comprend : la tâche, les centres d'intérêt et leur explication."
          },
          {
            titre: "II. Plan détaillé",
            texte: "1. Introduction : contexte général, présentation du texte, annonce du plan.\n2. Développement : CI 1 + CI 2 (fond et forme liés).\n3. Conclusion : bilan, jugement critique, ouverture."
          },
          {
            titre: "III. Technique de rédaction",
            texte: "Le commentaire composé se rédige sans dissocier le fond de la forme. Chaque analyse stylistique est immédiatement interprétée et reliée au sens global du texte."
          }
        ]
      }
    ]
  },
  {
    id: "tle-fr-l3",
    classe: "Terminale",
    matiere: "Français",
    lecon: 3,
    titre: "Questions + Résumé + Production écrite",
    competence: "COMPÉTENCE 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    programme: "Toutes séries",
    total_seances: 10,
    seances: [
      { numero: 1, titre: "Réponses aux questions / consignes" },
      { numero: 2, titre: "Identification de la situation d'argumentation" },
      { numero: 3, titre: "Sélection des idées essentielles et établissement d'un enchaînement logique" },
      { numero: 4, titre: "Reformulation des idées essentielles" },
      { numero: 5, titre: "Rédaction du résumé" },
      { numero: 7, titre: "Analyse du sujet et recherche des idées" },
      { numero: 8, titre: "Organisation de l'argumentation" },
      { numero: 9, titre: "Rédaction d'un paragraphe argumentatif" },
      { numero: 10, titre: "Rédaction de l'introduction et de la conclusion" },
      { numero: 11, titre: "Rédaction d'une production écrite complète" }
    ],
    auteur_fiche: "M. ZOGBE Jean Laurent",
    textes_supports: [
      "Jérémy RIFKIN, «Aujourd'hui, tout le monde est touriste», Une nouvelle conscience pour un monde en crise, éd. Nouveaux Horizons, avril 2011 (678 mots)",
      "Valentin MBOUGUENG, «Où vont les négociations climatiques internationales ?», Fraternité Matin N°14422, décembre 2012 (742 mots)"
    ]
  },
  {
    id: "premiere-fr-commentaire-compose",
    classe: "1ère",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon 1 : Le commentaire composé",
    programme: "Toutes séries",
    situation: "Au cours de leurs recherches à la bibliothèque, des élèves de la Première découvrent dans un ouvrage un sujet de commentaire composé. Curieux de comprendre le fonctionnement de cet exercice, ces élèves s'organisent pour analyser le libellé, identifier les centres d'intérêt, rechercher et organiser les idées en vue de rédiger le commentaire composé.",
    textes_supports: [
      "Texte 1 : extrait narratif sur l'immigration clandestine (personnage Viepp, voyage vers l'Europe)",
      "Texte 2 : poème « Rose noire » (portrait de la femme noire et influence du temps sur sa beauté)"
    ],
    seances: [
      {
        numero: 1,
        titre: "Analyse du libellé et construction du sens du texte",
        habiletes: [
          "Identifier les différents centres d'intérêt",
          "Expliquer les centres d'intérêt",
          "Relever les indices textuels pertinents du texte",
          "Analyser leur(s) effet(s) de sens",
          "Construire le sens du texte (type, tonalité, thème, idée générale)"
        ],
        contenu: [
          {
            titre: "I. Définition",
            texte: "Le commentaire composé est un exercice argumenté visant à mettre en valeur la qualité d'un texte. Il fait appel au fond (les idées) et à la forme (procédés grammaticaux, figures de style…). Commenter, c'est révéler la signification profonde d'un texte en allant au-delà de l'explicite."
          },
          {
            titre: "II. Analyse du libellé",
            texte: "Le libellé comprend deux composantes :\n1. La tâche : indique le travail à accomplir (ex. : « Faites un commentaire composé de ce texte »).\n2. Les centres d'intérêt (CI) : indiquent les grandes orientations du développement. Chaque CI est un thème à exploiter à l'aide d'indices textuels (procédés grammaticaux, figures de style…)."
          },
          {
            titre: "III. Construction du sens du texte",
            texte: "1. Le type ou la nature du texte : récit, dialogue, discours, description, portrait, poème…\n2. La tonalité : sentiment ou impression ressenti après la lecture (lyrique, épique, tragique, comique…).\n3. Le thème : ce dont parle le texte.\n4. L'idée générale : ce que dit l'auteur à propos du thème."
          },
          {
            titre: "IV. Les indices textuels",
            texte: "Ce sont les éléments pertinents sélectionnés en fonction des centres d'intérêt. Types d'indices :\n- Lexicaux : champ lexical, niveau de langue, mots connotés.\n- Grammaticaux : types et formes de phrases, modes et temps verbaux, pronoms.\n- Stylistiques : figures de style (comparaison, métaphore, hyperbole, anaphore…).\n- D'énonciation : pronoms personnels, marques de subjectivité."
          }
        ]
      },
      {
        numero: 2,
        titre: "Organisation des centres d'intérêt",
        habiletes: [
          "Organiser les centres d'intérêt selon les indices textuels relevés",
          "Élaborer le plan détaillé : sous-titres, idées convergentes, moyens utilisés"
        ],
        contenu: [
          {
            titre: "I. Organisation des centres d'intérêt",
            texte: "Les indices textuels relevés sont répartis selon les centres d'intérêt annoncés dans le libellé. Étapes :\n1. La recherche des sous-titres : regrouper les interprétations voisines pour dégager 2 à 3 sous-thèmes par CI.\n2. Le plan détaillé : repérer les citations illustrant chaque CI, indiquer les techniques littéraires et leurs interprétations, regrouper les interprétations convergentes en sous-parties (2 minimum, 4 maximum).\n3. Vérifier la cohérence : chaque sous-partie doit être illustrée par un indice textuel précis tiré du texte support."
          }
        ]
      },
      {
        numero: 3,
        titre: "Rédaction d'un paragraphe",
        habiletes: [
          "Identifier les composantes d'un paragraphe argumentatif",
          "Rédiger l'idée directrice",
          "Rédiger l'explication et l'illustration",
          "Rédiger la transition vers le paragraphe suivant"
        ],
        contenu: [
          {
            titre: "I. Les composantes d'un paragraphe argumentatif",
            texte: "1. L'idée directrice (sous-thème) : l'argument développé dans le paragraphe, énoncé en une phrase claire.\n2. L'explication : dire ce que l'idée directrice signifie exactement, pourquoi elle apparaît dans le texte.\n3. L'illustration : un ou deux indices textuels (citations) tirés du texte, suivis de leur analyse stylistique et interprétation.\n4. La conclusion du sous-thème et annonce du suivant : reprendre l'idée développée et établir le lien logique avec le paragraphe suivant."
          },
          {
            titre: "II. Rédaction d'un paragraphe (exemple)",
            texte: "Exemple sur le texte 1 (immigration clandestine) :\nIdée directrice : Le désespoir pousse le personnage à risquer sa vie pour rejoindre l'Europe.\nExplication : Viepp incarne la détresse de millions de migrants qui fuient misère et instabilité en cherchant une vie meilleure.\nIllustration : [indice textuel du texte] → analyse de la figure de style ou du procédé grammatical → interprétation.\nTransition : Si le désespoir explique ce départ, qu'en est-il des conditions du voyage lui-même ?"
          }
        ]
      },
      {
        numero: 4,
        titre: "Rédaction d'un centre d'intérêt",
        habiletes: [
          "Rédiger la phrase introductive du centre d'intérêt",
          "Enchaîner plusieurs paragraphes argumentatifs avec cohérence",
          "Rédiger la conclusion partielle du centre d'intérêt"
        ],
        contenu: [
          {
            titre: "I. Structure d'un centre d'intérêt",
            texte: "Un centre d'intérêt (CI) se compose de :\n1. Une phrase introductive : annonce le thème du CI à l'aide d'un connecteur logique (Premièrement / En premier lieu / D'emblée…).\n2. Les paragraphes argumentatifs : 2 à 4 sous-thèmes, chacun rédigé selon la méthode vue en séance 3.\n3. Une conclusion partielle : synthèse du CI + question rhétorique ou annonce du CI suivant."
          },
          {
            titre: "II. Exemple de rédaction d'un CI (texte 2 – « Rose noire »)",
            texte: "CI 1 – Le portrait de la femme noire :\nPhrase introductive : « Dans un premier temps, le poète dresse le portrait physique et moral de la femme noire. »\nSous-thème 1 : beauté physique → indices textuels → analyse → interprétation.\nSous-thème 2 : force intérieure → indices textuels → analyse → interprétation.\nConclusion partielle : « En définitive, la femme noire est célébrée dans toute sa splendeur. Mais cette beauté est-elle éternelle ? »"
          }
        ]
      },
      {
        numero: 5,
        titre: "Rédaction d'une introduction et d'une conclusion",
        habiletes: [
          "Rédiger l'introduction (amorce, présentation du texte, annonce du plan)",
          "Rédiger la conclusion (bilan, jugement critique, ouverture)"
        ],
        contenu: [
          {
            titre: "I. L'introduction",
            texte: "Elle se rédige en un seul paragraphe et comprend trois parties :\n1. L'amorce (contexte général) : approche thématique, mouvement littéraire, contexte social/culturel ou citation en rapport avec le texte.\n2. La présentation du texte : auteur (nom, nationalité, époque), œuvre (titre, genre, date de publication), nature du texte, tonalité dominante, idée générale.\n3. L'annonce du plan : rappel des centres d'intérêt dans l'ordre du développement."
          },
          {
            titre: "II. La conclusion",
            texte: "Elle comprend trois parties :\n1. Le bilan : synthèse des deux (ou trois) centres d'intérêt développés.\n2. Le jugement critique : prise de position personnelle sur le thème ou la valeur du texte.\n3. L'ouverture : rapprochement avec un autre texte traitant du même thème, ou élargissement à une problématique plus large."
          }
        ]
      },
      {
        numero: 6,
        titre: "Rédaction du commentaire composé (texte 1)",
        habiletes: [
          "Identifier les parties du libellé",
          "Élaborer le plan détaillé",
          "Rédiger intégralement le commentaire composé du texte support 1 (immigration clandestine)"
        ],
        contenu: [
          {
            titre: "I. Application complète – Texte 1",
            texte: "Texte support : extrait narratif sur l'immigration clandestine (personnage Viepp, voyage vers l'Europe).\n1. Analyse du libellé : identifier la tâche et les centres d'intérêt.\n2. Plan détaillé : organiser les indices textuels par CI, élaborer les sous-thèmes.\n3. Rédaction : Introduction → CI 1 (paragraphes + conclusion partielle) → CI 2 (paragraphes + conclusion partielle) → Conclusion.\nLe commentaire composé lie fond et forme à chaque analyse : tout procédé stylistique doit être immédiatement interprété et relié au sens global du texte."
          }
        ]
      },
      {
        numero: 7,
        titre: "Rédaction du commentaire composé (texte 2 – transfert de compétence)",
        habiletes: [
          "Transférer les compétences acquises sur un nouveau texte",
          "Rédiger intégralement le commentaire composé du texte support 2 (« Rose noire »)"
        ],
        contenu: [
          {
            titre: "I. Application complète – Texte 2",
            texte: "Texte support : poème « Rose noire » — portrait de la femme noire et influence du temps sur sa beauté.\n1. Analyse du libellé : identifier la tâche et les centres d'intérêt spécifiques au texte poétique.\n2. Spécificités du poème : versification (vers, rimes, strophes), figures de style dominantes (métaphore, personnification, comparaison), registre lyrique.\n3. Plan détaillé et rédaction complète : Introduction → CI 1 → CI 2 → Conclusion.\nCette séance constitue un transfert de compétence : l'élève applique seul la démarche complète sur un texte de nature différente (poétique vs narratif)."
          }
        ]
      }
    ]
  },
  {
    id: "premiere-fr-l2",
    classe: "1ère",
    matiere: "Français",
    lecon: 2,
    titre: "Questions + Résumé + Production écrite",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    programme: "Toutes séries",
    total_seances: 10,
    seances: [
      { numero: 1,  titre: "Réponses aux questions/consignes",                       habiletes: "Identifier, analyser et répondre aux consignes de compréhension d'un texte argumentatif (thème, thèse, problèmes, idée générale)" },
      { numero: 2,  titre: "Identification de la situation d'argumentation",          habiletes: "Identifier le thème, la thèse, les indices d'énonciation, les temps verbaux, les connecteurs logiques, la structure du texte et déterminer la visée argumentative" },
      { numero: 3,  titre: "Sélection des idées essentielles et enchaînement logique",habiletes: "Identifier les connecteurs logiques, distinguer thèse/arguments/exemples, sélectionner les idées essentielles et établir un enchaînement logique entre elles" },
      { numero: 4,  titre: "Reformulation des idées essentielles",                    habiletes: "Utiliser les techniques de réduction de texte (termes génériques, synonymes, transformation de phrases complexes en phrases simples) pour reformuler les idées essentielles" },
      { numero: 5,  titre: "Rédaction du résumé",                                     habiletes: "Appliquer la technique du résumé, rédiger le résumé en un seul bloc sans introduction/développement/conclusion, respecter le nombre de mots et la marge de tolérance de ±10%" },
      { numero: 7,  titre: "Analyse du sujet et recherche des idées",                 habiletes: "Identifier la composition du sujet (information + consigne), examiner thème/thèse/mots-clés, distinguer étayer et réfuter, reformuler la thèse, rechercher des arguments liés au sujet" },
      { numero: 8,  titre: "Organisation de l'argumentation",                         habiletes: "Classer les arguments et les illustrer par des exemples, élaborer le plan du développement" },
      { numero: 9,  titre: "Rédaction d'un paragraphe argumentatif",                  habiletes: "Identifier les composantes d'un paragraphe argumentatif (annoncer, expliquer, illustrer, conclure l'argument) et rédiger un paragraphe complet" },
      { numero: 10, titre: "Rédaction de l'introduction et de la conclusion",         habiletes: "Identifier les composantes de l'introduction (accroche : auteur, source, citation + annonce de la prise de position) et de la conclusion (bilan + ouverture facultative), rédiger les deux" },
      { numero: 11, titre: "Rédaction d'une production écrite complète",              habiletes: "Rédiger une production écrite argumentative complète (introduction, développement structuré en paragraphes argumentatifs, conclusion) à partir d'une citation tirée du texte support" }
    ],
    textes_supports: [
      { titre: "Du tourisme mondial",         auteur: "E. Mestiri",   source: "Le Monde, 20 septembre 1985",                          nbMots: 599 },
      { titre: "La conservation de la nature",auteur: "Jean Dorst",   source: "La nature dé-naturée, Ed. Le Seuil, Points, 1970",      nbMots: 608 }
    ]
  },
  {
    id: "premiere-fr-dissertation-litteraire",
    classe: "1ère",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon 3 : La dissertation littéraire",
    programme: "Toutes séries",
    total_seances: 6,
    sujets: [
      {
        numero: 1,
        citation: "La littérature négro-africaine est une littérature de remise en cause et de remise en place.",
        auteurCitation: "Emmanuel Dongala",
        consigne: "Dans un développement argumenté et illustré d'exemples précis tirés d'œuvres littéraires lues ou étudiées, expliquez et discutez ces propos.",
        typePlan: "dialectique (thèse/antithèse)"
      },
      {
        numero: 2,
        citation: "Romanciers révolutionnaires, poètes militants, dramaturges engagés, tout a été dit pour célébrer la littérature. Et pourtant l'écrivain n'est qu'un moustique qui bourdonne autour d'une pyramide.",
        consigne: "Dans un développement organisé et illustré d'exemples tirés d'œuvres littéraires étudiées ou lues, dites ce que vous inspire cette opinion.",
        typePlan: "dialectique"
      }
    ],
    seances: [
      { numero: 1, titre: "Analyse du sujet",                             habiletes: "Définir la dissertation littéraire, distinguer les types de sujets (avec citation : information + consigne ; sans citation : consigne enchâssée), identifier les éléments essentiels (mots-clés) et leur sens, reformuler le sujet, dégager la problématique (problème, thèse, antithèse)" },
      { numero: 2, titre: "Recherche des idées",                          habiletes: "Mobiliser sa culture littéraire pour trouver des arguments soutenant la thèse et l'antithèse, illustrer chaque argument par des exemples précis tirés d'œuvres littéraires africaines" },
      { numero: 3, titre: "Élaboration du plan",                          habiletes: "Distinguer le plan inventaire/explicatif (expliquez, justifiez, montrez, commentez) et le plan dialectique (appréciez, discutez, partagez-vous), construire le plan en organisant arguments et exemples en paragraphes argumentatifs (énoncé, explication, illustration, conclusion/transition), identifier les transitions entre parties" },
      { numero: 4, titre: "Rédaction d'une partie du développement",      habiletes: "Rédiger une partie du développement en respectant sa structure : phrase introductive énonçant l'idée directrice, paragraphes argumentatifs (argument + 1-2 exemples chacun), phrase conclusive et transitionnelle" },
      { numero: 5, titre: "Rédaction d'une introduction et d'une conclusion", habiletes: "Rédiger une introduction (généralités/perspective générale, énoncé du sujet/citation, problématique, annonce du plan) et une conclusion (bilan, jugement personnel, ouverture)" },
      { numero: 6, titre: "Rédaction d'une dissertation littéraire complète",  habiletes: "Rédiger une dissertation littéraire intégrale (introduction, développement structuré en deux parties thèse/antithèse avec paragraphes argumentatifs et exemples, conclusion)" }
    ]
  },
  {
    id: "seconde-fr-questions-resume-production",
    classe: "2nde",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon : Questions + Résumé + Production écrite",
    programme: "Toutes séries",
    total_seances: 9,
    seances: [
      { numero: 1, titre: "Répondre aux consignes/questions",                               habiletes: "Présenter l'exercice (questions de compréhension, résumé, production écrite), identifier les types de questions (système énonciatif, organisation lexicale, organisation argumentative) et y répondre correctement" },
      { numero: 2, titre: "Identifier la situation d'argumentation",                        habiletes: "Identifier le thème, le champ lexical lié au thème, la thèse, le champ lexical lié à la thèse (arguments), la thèse contraire, les indices d'énonciation, la structure du texte (séquences) et la visée argumentative" },
      { numero: 3, titre: "Sélection des idées essentielles et enchaînement logique",       habiletes: "'Toiletter' le texte en éliminant exemples, digressions, parenthèses, répétitions, énumérations, comparaisons, chiffres et explications ; identifier les connecteurs logiques, distinguer thèse/arguments/exemples, sélectionner les idées essentielles et établir un enchaînement logique entre elles" },
      { numero: 4, titre: "Reformuler les idées essentielles",                              habiletes: "Reformuler les idées essentielles en utilisant synonymes, adjectifs à la place de compléments ou de relatives, adverbes à la place de groupes prépositionnels, mots englobants à la place d'énumérations, phrases simples à la place de phrases complexes, ponctuation à la place de connecteurs, participe présent ou proposition infinitive, et en changeant la nature ou la voix des mots/verbes" },
      { numero: 5, titre: "Rédiger collectivement le résumé",                               habiletes: "Rédiger le résumé à partir des idées essentielles reformulées, en respectant la technique et les contraintes du résumé ainsi que le schéma argumentatif de base" },
      { numero: 6, titre: "Production d'un texte argumentatif - Analyse du sujet et recherche des idées", habiletes: "Analyser le sujet (information : pensée/citation/thème/thèse/mots-clés ; consigne : étayer, réfuter ou discuter), rechercher des idées en variant les domaines (social, éducatif, économique, familial, conjugal, etc.)" },
      { numero: 7, titre: "Organiser les arguments",                                        habiletes: "Organiser l'argumentation en classant les arguments et leurs exemples de manière cohérente, identifier les composantes d'un paragraphe argumentatif (argument, explication, exemple) et rédiger des paragraphes argumentatifs" },
      { numero: 8, titre: "Rédiger l'introduction et la conclusion",                        habiletes: "Rédiger une introduction (phrase d'accrochage avec auteur/titre/source/date, insertion de la thèse à étayer/réfuter, annonce du plan) et une conclusion (bilan + ouverture)" },
      { numero: 9, titre: "Rédiger un texte argumentatif",                                  habiletes: "Rédiger un texte argumentatif complet (introduction, développement en paragraphes argumentatifs, conclusion)" }
    ],
    textes_supports: [
      { titre: "La délinquance juvénile : la part des responsabilités", auteur: "Kebe Yacouba", source: "L'Enquête, Fraternité Matin", nbMots: 411, ratioResume: "1/4" },
      { titre: "Le travail",                                            auteur: "Camille Jullian", source: "Jeune Afrique, Nov. 2008",   nbMots: 592, ratioResume: "1/3" }
    ]
  },
  {
    id: "seconde-fr-commentaire-compose",
    classe: "2nde",
    matiere: "Français",
    competence: "Compétence 3 : Traiter des situations relatives à la rédaction des écrits divers",
    activite: "Expression écrite",
    lecon: "Leçon 2 : Le commentaire composé",
    programme: "Toutes séries",
    particularite: "Commentaire composé partiel (introduction + 1 centre d'intérêt uniquement, conformément au programme de 2nde)",
    total_seances: 6,
    seances: [
      { numero: 1, titre: "Analyse du libellé et construction du sens du texte", habiletes: "Définir le commentaire composé (étude du fond et de la forme), analyser le libellé (tâche + centres d'intérêt), construire le sens du texte (type/nature : récit, dialogue, discours, description, portrait, poème ; tonalité ; thème ; idée générale), repérer les indices textuels (procédés grammaticaux, figures de style) et les interpréter" },
      { numero: 2, titre: "Organisation des centres d'intérêt",                  habiletes: "Identifier les centres d'intérêt selon l'ordre du libellé, dégager 3-4 sous-titres (sous-thèmes) par regroupement des indices textuels selon leur sens, construire le tableau du plan détaillé (sous-titres / repérages-indices textuels / analyses / interprétations) pour le premier centre d'intérêt, rédiger une phrase conclusive et transitionnelle" },
      { numero: 3, titre: "Rédaction d'un paragraphe argumentatif",              habiletes: "Identifier les composantes d'un paragraphe argumentatif (idée directrice/sous-thème, explication, illustration par un ou deux indices textuels tirés du texte support, conclusion + annonce du sous-thème suivant) et rédiger un tel paragraphe" },
      { numero: 4, titre: "Rédaction d'un centre d'intérêt",                     habiletes: "Rédiger un centre d'intérêt complet : phrase introductive annonçant le centre d'intérêt, enchaînement de paragraphes argumentatifs reliés par des connecteurs logiques/organisateurs textuels, conclusion partielle et transition vers le centre d'intérêt suivant" },
      { numero: 5, titre: "Rédaction d'une introduction",                        habiletes: "Rédiger une introduction en un seul paragraphe comprenant : le contexte général/l'amorce (approche thématique, biographique, littéraire...), la présentation du texte (auteur, œuvre, genre, date de publication, nature/tonalité/idée générale du texte), et l'annonce du plan/des centres d'intérêt" },
      { numero: 6, titre: "Rédaction d'un commentaire composé partiel",          habiletes: "Identifier les parties du libellé (tâche + centres d'intérêt), élaborer le plan détaillé (introduction + développement limité au centre d'intérêt 1 pour la 2nde), rédiger un commentaire composé partiel complet : introduction + premier centre d'intérêt, en exploitant le texte sans dissocier le fond de la forme" }
    ],
    textes_supports: [
      {
        titre: "Les enfants de la rue",
        auteur: "Sylvain Kean Zoh",
        oeuvre: "Le printemps de la fleur fanée",
        source: "éditions NEI/CEDA, 2009",
        consigne: "Vous ferez de ce texte un commentaire composé. Vous étudierez comment l'auteur relate la marche épique du narrateur-personnage tout en faisant transparaître un bel avenir pour les enfants de la rue.",
        centresInteret: ["La marche épique du narrateur-personnage", "Le bel avenir pour les enfants de la rue"]
      },
      {
        titre: "La Plaie (extrait)",
        auteur: "Malick Fall",
        source: "Albin Michel, 1967",
        consigne: "Vous ferez un commentaire composé de ce texte. Vous montrerez comment à travers le style, l'auteur fait de la condition du narrateur une situation pathétique."
      }
    ]
  }
];

app.get('/api/fiches', (req, res) => {
  const { classe, matiere } = req.query;
  let result = FICHES;
  if (classe) result = result.filter(f => f.classe === classe);
  if (matiere) result = result.filter(f => f.matiere === matiere);
  res.json(result);
});

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
const ADMIN_KEY      = process.env.ADMIN_KEY || 'EDUCI_ADMIN_2026';
const LIMITE_APPAREILS = 3;

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

  const deviceId = (req.query.device_id || '').trim();
  if (deviceId) {
    if (!Array.isArray(sub.appareils)) sub.appareils = [];
    if (!sub.appareils.includes(deviceId)) {
      if (sub.appareils.length >= LIMITE_APPAREILS) {
        return res.json({ abonneActif: true, appareilAutorise: false });
      }
      sub.appareils.push(deviceId);
      sauvegarder();
    }
  }

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

// === SUGGESTIONS UTILISATEURS ===
const SUGGESTIONS_PATH = path.join(__dirname, 'suggestions.json');
const CATEGORIES_VALIDES = ['bug', 'idee', 'contenu', 'autre'];

function chargerSuggestions() {
  try {
    if (!fs.existsSync(SUGGESTIONS_PATH)) {
      fs.writeFileSync(SUGGESTIONS_PATH, '[]');
      return [];
    }
    return JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, 'utf8'));
  } catch (e) {
    console.error('Erreur lecture suggestions.json:', e.message);
    return [];
  }
}

function sauvegarderSuggestions() {
  try {
    fs.writeFileSync(SUGGESTIONS_PATH, JSON.stringify(suggestions, null, 2));
  } catch (e) {
    console.error('Erreur écriture suggestions.json:', e.message);
  }
}

const suggestions = chargerSuggestions();
console.log(`📂 ${suggestions.length} suggestion(s) chargée(s) depuis suggestions.json`);

app.post('/api/suggestions', (req, res) => {
  const { telephone, categorie, message } = req.body || {};
  if (!telephone || String(telephone).trim() === '')
    return res.status(400).json({ error: 'Le champ téléphone est requis.' });
  if (!CATEGORIES_VALIDES.includes(categorie))
    return res.status(400).json({ error: `Catégorie invalide. Valeurs acceptées : ${CATEGORIES_VALIDES.join(', ')}.` });
  if (!message || String(message).trim().length < 5)
    return res.status(400).json({ error: 'Le message doit contenir au moins 5 caractères.' });
  if (String(message).trim().length > 1000)
    return res.status(400).json({ error: 'Le message ne doit pas dépasser 1000 caractères.' });

  const suggestion = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    telephone: String(telephone).trim(),
    categorie,
    message: String(message).trim(),
    date: new Date().toISOString(),
    statut: 'nouveau'
  };
  suggestions.push(suggestion);
  sauvegarderSuggestions();
  res.json({ success: true });
});

app.get('/api/suggestions', (req, res) => {
  if (req.query.key !== ADMIN_KEY)
    return res.status(401).json({ error: 'Clé invalide' });
  const triees = [...suggestions].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(triees);
});

app.patch('/api/suggestions/:id', (req, res) => {
  if (req.query.key !== ADMIN_KEY)
    return res.status(401).json({ error: 'Clé invalide' });
  const { statut } = req.body || {};
  if (!['nouveau', 'lu', 'traite'].includes(statut))
    return res.status(400).json({ error: 'Statut invalide. Valeurs acceptées : nouveau, lu, traite.' });
  const idx = suggestions.findIndex(s => s.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ error: 'Suggestion introuvable.' });
  suggestions[idx].statut = statut;
  sauvegarderSuggestions();
  res.json({ success: true });
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

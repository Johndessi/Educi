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
---`;

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

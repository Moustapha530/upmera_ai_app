# UPMERA AI

Application web de gestion d’activité destinée aux petites entreprises : ventes, dépenses, trésorerie, stock, clients, fournisseurs, factures et indicateurs.

> **État du projet : frontend de démonstration.** L’interface et ses formulaires sont interactifs, mais aucun backend n’est actuellement connecté. Les données affichées sont des exemples et les modifications sont enregistrées dans le navigateur utilisé. L’authentification, les réponses IA, la lecture de reçus, les invitations, les e-mails et les paiements sont simulés. Ne pas utiliser cette version pour stocker des données réelles ou sensibles.

## Démarrer l’application

### Prérequis

- Git
- Node.js **20.9 ou plus récent** (Node.js 22 LTS recommandé)
- npm (fourni avec Node.js)

### Première installation

Cloner le dépôt GitHub puis installer les dépendances à partir du fichier de verrouillage :

```bash
git clone https://github.com/Moustapha530/upmera_ai_app.git
cd upmera_ai_app
npm ci
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000). Next.js démarre normalement sur le port 3000 ; s’il est déjà utilisé, le terminal indique le port de remplacement.

Pour démarrer le projet déjà cloné par un collègue :

```bash
git pull
npm ci
npm run dev
```

Aucune variable d’environnement n’est nécessaire pour lancer le frontend de démonstration.

### Commandes du projet

| Commande | Utilité |
| --- | --- |
| `npm run dev` | Démarrer le serveur de développement Next.js |
| `npm run lint` | Vérifier le code avec ESLint |
| `npm run typecheck` | Vérifier les types TypeScript |
| `npm run build` | Générer le build de production |
| `npm run start` | Servir le build de production, après `npm run build` |

Avant une pull request, lancer au minimum :

```bash
npm run lint
npm run typecheck
npm run build
```

## Organisation du frontend

- `app/` : layout Next.js, page d’entrée et styles globaux.
- `components/` : écrans et composants, regroupés par domaine (dashboard, ventes, stock, factures, équipe, etc.).
- `hooks/use-app-data.ts` : état métier de démonstration et actions locales, persistés avec Zustand.
- `hooks/use-preferences.ts` : langue, devise, fuseau horaire et préférences locales.
- `lib/data.ts` : jeu de données initial de démonstration.
- `lib/calculations/finance.ts` : calculs financiers côté frontend.
- `lib/services/ai.ts` : réponses et indicateurs IA simulés.
- `lib/validations/schemas.ts` : validations des formulaires.
- `messages/` : catalogues anglais et français.
- `types/index.ts` : principaux types métier TypeScript.

La navigation entre les écrans de l’application utilise le fragment d’URL (par exemple `/#/home` ou `/#/inventory`) ; les pages ne correspondent pas encore à des routes Next.js distinctes.

### Données de démonstration

Les exemples viennent de `lib/data.ts`. Zustand les complète avec les changements créés dans l’application et les conserve dans le `localStorage` de ce navigateur. Ils ne sont donc ni partagés entre les collaborateurs, ni synchronisés entre appareils, ni sauvegardés par un serveur.

Pour repartir du jeu de données initial, supprimer les clés `upmera-ai-demo-v1`, `upmera-preferences-v1` et, si nécessaire, `upmera-onboarding-v1` dans les données du site du navigateur, puis recharger la page. Cette opération supprime les changements locaux de démonstration.

## Intégration du backend

### Situation actuelle

Le dépôt ne contient pas de backend ni de contrat API implémenté : il n’y a pas d’URL de service à configurer pour le moment et le frontend n’appelle pas de serveur métier. Les types et exemples existants sont un point de départ pour définir le contrat, pas une API déjà disponible.

Avant de développer l’intégration, se mettre d’accord avec le collaborateur backend sur la technologie, l’URL locale, les environnements, les règles d’authentification et un schéma OpenAPI partagé. Si le backend se trouve dans un autre dépôt, documenter son propre processus de démarrage et le lancer séparément du frontend.

### Architecture d’intégration recommandée

1. **Définir et documenter l’API** (idéalement OpenAPI) avec des réponses et erreurs cohérentes. Prévoir la pagination et le filtrage des listes.
2. **Ajouter la configuration locale** dans un fichier `.env.local` non commité. Après création du proxy serveur, une configuration locale peut par exemple contenir :

   ```env
   API_BASE_URL=http://localhost:8000
   ```

   `API_BASE_URL` est ici une convention proposée, pas une variable déjà lue par l’application. La faire lire côté serveur seulement. Ne pas exposer de clé secrète ou de jeton dans une variable `NEXT_PUBLIC_*` ni dans le code navigateur.
3. **Créer une couche d’accès typée** dans `lib/services/` (par exemple `transactions.ts`, `products.ts`, `customers.ts`) et des gestionnaires Next.js dans `app/api/` si l’application sert de proxy/BFF. Le navigateur appelle alors le même domaine Next.js ; le serveur relaie les requêtes vers le backend à partir de `API_BASE_URL`. Cela évite d’exposer les secrets et réduit les problèmes CORS.
4. **Remplacer progressivement les données simulées** : charger les listes depuis l’API, brancher les formulaires aux opérations de création/modification, afficher les états de chargement et les erreurs, puis actualiser l’état après les mutations. Garder Zustand pour l’état d’interface et les préférences locales ; la base du backend doit devenir la source de vérité des données métier.
5. **Connecter l’authentification avant les données privées** : sessions sécurisées par cookies `HttpOnly`, `Secure` en production et politique `SameSite` adaptée ; gérer l’expiration, la déconnexion et les réponses `401`. Ne pas conserver les mots de passe ni les jetons d’accès dans `localStorage`.
6. **Tester les droits et les cas métier** : deux entreprises/utilisateurs ne doivent jamais pouvoir accéder aux données l’un de l’autre. Protéger les opérations sensibles côté serveur et valider à nouveau les données côté backend — la validation du frontend ne suffit pas.

Un appel direct du navigateur au backend est aussi possible, mais nécessite alors une politique CORS explicite et une gestion sûre des cookies. Éviter les secrets côté client.

### Ressources API à prévoir

À adapter au contrat retenu ; ces chemins sont des **propositions**, pas des endpoints existants :

| Domaine | Exemples d’opérations |
| --- | --- |
| Session et compte | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/me` |
| Activité métier | CRUD `/api/v1/transactions`, `/products`, `/customers`, `/suppliers` |
| Suivi | CRUD `/api/v1/trips`, `/goals`, `/invoices`, `/team`, `/stores` |
| Synthèses | `GET /api/v1/reports/summary`, endpoints d’indicateurs et d’analyses IA |
| Fonctionnalités externes | analyse OCR, envoi d’e-mails, export PDF et paiement via des services dédiés côté serveur |

Les types de référence se trouvent dans `types/index.ts` (`Transaction`, `Product`, `Customer`, `Supplier`, `Invoice`, etc.). Se mettre d’accord sur les champs, les statuts, les formats de date et la devise ; le backend doit notamment éviter les erreurs d’arrondi monétaire (par exemple en utilisant des montants décimaux ou des unités monétaires mineures avec une convention documentée). Les règles de calcul financier doivent être partagées et testées entre frontend et backend.

### Checklist pour l’équipe

- [ ] Le backend fournit des instructions de démarrage et une URL locale documentées.
- [ ] Le contrat OpenAPI et les exemples d’erreur sont validés par les deux côtés.
- [ ] Authentification, rôles, permissions et séparation des données d’entreprise sont vérifiés côté serveur.
- [ ] `.env.local` contient uniquement des valeurs locales et n’est jamais envoyé sur GitHub.
- [ ] Les opérations de lecture et d’écriture remplacent les données de démonstration pour chaque module livré.
- [ ] Les scénarios de connexion, déconnexion, validation, erreur réseau et accès interdit sont testés.
- [ ] Les données sensibles et vraies données financières ne sont pas utilisées tant que le backend n’est pas sécurisé et déployé correctement.

## Contribution

Créer une branche pour chaque changement, puis ouvrir une pull request vers `main`. Dans la description, préciser les écrans concernés, les vérifications exécutées et, pour une intégration backend, les endpoints utilisés. Ne jamais commiter `.env.local`, un mot de passe, un jeton ou des données client.

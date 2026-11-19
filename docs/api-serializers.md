# Champs API proposés pour les serializers

Ce document décrit les données demandées par les formulaires du frontend UPMERA AI. Il sert de base à la conception des serializers Django REST Framework ou FastAPI/Pydantic. Les champs marqués `lecture seule` doivent être calculés ou générés par le backend.

## Conventions communes

- Les montants doivent être des nombres décimaux sérialisés comme chaînes (ou des entiers en unité mineure) afin d’éviter les erreurs d’arrondi.
- Toutes les dates utilisent le format `YYYY-MM-DD`.
- Les horodatages utilisent ISO 8601, par exemple `2026-11-19T14:30:00Z`.
- `id` est un identifiant public stable en lecture seule.
- `business_id` / `store_id` identifient le tenant ou le magasin et ne doivent pas être fournis par le navigateur pour contourner les droits.
- Les relations utilisent généralement leur clé primaire ou un UUID, avec un objet imbriqué facultatif en lecture.
- Les statuts sont des énumérations fermées côté backend.

## TransactionSerializer

Champs actuellement demandés :

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `TX-2810` |
| `title` | string | oui | Minimum 2 caractères |
| `type` | enum | oui | `income`, `expense`, `purchase`, `sale`, `transfer` |
| `amount` | decimal | oui | Strictement supérieur à zéro |
| `cogs` | decimal | non | Coût des produits vendus |
| `cash_impact` | decimal | non | Flux réel ; `0` pour une vente à crédit |
| `date` | date | oui | Format `YYYY-MM-DD` |
| `category` | string | oui | Catégorie métier |
| `payment_method` | enum | oui | `Cash`, `Mobile money`, `Bank transfer`, `Card`, `Credit` |
| `description` | string | non | Texte libre |
| `status` | enum | lecture seule | `Completed`, `Pending`, `Overdue` |
| `product_id` | UUID/PK | non | Produit lié |
| `customer_id` | UUID/PK | non | Client lié |
| `trip_id` | UUID/PK | non | Déplacement lié |

## ExpenseSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `title` | string | oui | Minimum 2 caractères |
| `amount` | decimal | oui | Montant strictement positif |
| `category` | enum/string | oui | Ex. `Transportation`, `Rent`, `Internet` |
| `date` | date | oui | Date de la dépense |
| `payment_method` | enum | oui | Moyen de règlement |
| `trip_id` | UUID/PK | non | Déplacement associé |
| `receipt` | fichier image | non | Reçu joint |
| `notes` | string | non | Détails ou justificatif |

Le backend doit créer la transaction correspondante, sans accepter séparément un champ `expense_type` différent de `expense`.

## ProductSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `PR-1001` |
| `name` | string | oui | Minimum 2 caractères |
| `sku` | string | oui | Unique dans l’entreprise |
| `category` | enum/string | oui | Ex. `Staples`, `Beverages` |
| `stock` | entier | oui | Quantité disponible, supérieure ou égale à zéro |
| `purchase_price` | decimal | oui | Prix d’achat |
| `selling_price` | decimal | oui | Prix de vente |
| `threshold` | entier | oui | Seuil de stock bas |
| `image` | fichier image | non | Photo du produit |
| `description` | string | non | Présentation du produit |

Champs calculés recommandés : `status` (`In stock`, `Low stock`, `Out of stock`) et `margin`.

## CustomerSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `CU-2001` |
| `name` | string | oui | Minimum 2 caractères |
| `phone` | string | oui | Minimum 7 caractères |
| `email` | email | non | Peut être vide |
| `address` | string | non | Adresse postale |
| `notes` | string | non | Informations internes |
| `purchases` | decimal | lecture seule | Total historique des achats |
| `balance` | decimal | lecture seule | Solde restant dû |
| `last_purchase` | date/string | lecture seule | Dernier achat |
| `status` | enum | lecture seule | `Active`, `New`, `Inactive` |

## SupplierSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `SU-301` |
| `name` | string | oui | Nom de l’entreprise ou du fournisseur |
| `contact` | string | non | Personne de contact |
| `phone` | string | oui | Minimum 7 caractères |
| `email` | email | non | Peut être vide |
| `address` | string | non | Adresse postale |
| `notes` | string | non | Informations internes |
| `spent` | decimal | lecture seule | Total des achats fournisseurs |
| `balance` | decimal | lecture seule | Dette fournisseur |
| `status` | enum | lecture seule | `Active`, `Pending` |

## TripSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `TR-024` |
| `name` | string | oui | Nom du déplacement |
| `destination` | string | oui | Ville et pays |
| `starting_location` | string | non | Point de départ |
| `purpose` | string | oui | Motif du déplacement |
| `start_date` | date | oui | Date de départ |
| `end_date` | date | oui | Date de retour, postérieure ou égale au départ |
| `budget` | decimal | oui | Budget prévu |
| `notes` | string | non | Détails internes |
| `expenses` | decimal | lecture seule | Total des dépenses du déplacement |
| `merchandise` | decimal | lecture seule | Valeur des stocks acquis |
| `revenue` | decimal | lecture seule | Chiffre d’affaires attribué |
| `status` | enum | lecture seule | `Completed`, `In progress`, `Planned` |

## SaleCreateSerializer

Une vente est atomique : elle doit mettre à jour le stock, créer la transaction et éventuellement mettre à jour le compte client.

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `product_id` | UUID/PK | oui | Produit vendu |
| `quantity` | entier | oui | Strictement positif |
| `unit_price` | decimal | oui | Prix unitaire appliqué |
| `discount` | decimal | non | Remise totale, défaut `0` |
| `customer_id` | UUID/PK | non | Vide pour une vente comptoir |
| `payment_method` | enum | oui | Moyen de paiement |
| `date` | date | oui | Date de vente |
| `trip_id` | UUID/PK | non | Déplacement associé |
| `notes` | string | non | Commentaire |

Le serveur vérifie la disponibilité du stock et calcule `total = quantity × unit_price − discount` ainsi que `cogs`.

## PurchaseCreateSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `product_id` | UUID/PK | oui | Produit acheté |
| `quantity` | entier | oui | Strictement positif |
| `unit_price` | decimal | oui | Prix d’achat unitaire |
| `supplier_id` | UUID/PK | oui | Fournisseur |
| `date` | date | oui | Date d’achat |
| `shipping` | decimal | non | Frais de livraison, défaut `0` |
| `fees` | decimal | non | Frais supplémentaires, défaut `0` |
| `payment_method` | enum | oui | Moyen de paiement |
| `trip_id` | UUID/PK | non | Déplacement associé |
| `notes` | string | non | Commentaire |

Le backend calcule `total = quantity × unit_price + shipping + fees`, incrémente le stock et crée une transaction de type `purchase`.

## InvoiceSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `INV-208` |
| `customer_id` | UUID/PK | oui | Client facturé |
| `items` | tableau imbriqué | oui | Au moins une ligne |
| `issue_date` | date | oui | Date d’émission |
| `due_date` | date | oui | Date d’échéance |
| `tax_percent` | decimal | non | Taux global |
| `discount` | decimal | non | Remise totale |
| `amount` | decimal | lecture seule | Montant TTC calculé |
| `paid_amount` | decimal | lecture seule | Montant payé |
| `balance` | decimal | lecture seule | Solde restant |
| `status` | enum | lecture seule | `Paid`, `Pending`, `Partially paid`, `Overdue` |
| `transaction_id` | UUID/PK | lecture seule | Transaction liée |

Chaque ligne facture contient : `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`.

## CustomerPaymentSerializer / SupplierPaymentSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `party_id` | UUID/PK | oui | `customer_id` ou `supplier_id` selon l’opération |
| `amount` | decimal | oui | Strictement positif et inférieur ou égal au solde |
| `date` | date | non | Date du paiement, défaut à aujourd’hui |
| `payment_method` | enum | non | Défaut `Mobile money` |
| `reference` | string | non | Référence bancaire ou de paiement |

Le backend crée aussi la transaction financière correspondante et recalcule le solde.

## GoalSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `GO-01` |
| `name` | string | oui | Minimum 2 caractères |
| `current` | decimal | lecture seule | Progression calculée |
| `target` | decimal | oui | Objectif strictement positif |
| `due_date` | date | oui | Échéance |
| `unit` | enum | oui | `currency`, `sales` |
| `tone` | enum/string | non | Présentation optionnelle, ex. `amber`, `blue` |

## TeamMemberSerializer

| Champ | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `id` | string | lecture seule | Exemple : `TM-01` |
| `name` | string | oui | Nom complet |
| `email` | email | oui | Adresse unique dans l’entreprise |
| `role` | enum | oui | `Owner`, `Manager`, `Accountant`, `Salesperson` |
| `status` | enum | lecture seule | `Active`, `Invited` |

L’invitation peut utiliser un serializer séparé contenant `email` et `role`, puis créer `TeamMember` avec le statut `Invited`.

## Auth / Account serializers

### Inscription

`first_name`, `last_name`, `email`, `password`, `country`, `language`.

### Connexion

`email`, `password`, éventuellement `remember_me`.

### Utilisateur courant

`id`, `first_name`, `last_name`, `email`, `country`, `language`, `business_id`, `role`, `created_at`, `updated_at`.

Les mots de passe ne doivent jamais apparaître dans les serializers de réponse.

## Onboarding / Business serializers

Le frontend demande ces données lors de la configuration initiale :

- `first_name`, `last_name`, `email` ;
- `business_name`, `business_category`, `country`, `city`, `currency` ;
- `initial_capital`, `business_start_date` ;
- `language`, `timezone`, `low_stock_notifications`, `weekly_summary`.

## Receipt OCR serializer

Le fichier source et les données vérifiées peuvent être séparés en deux endpoints.

### Upload OCR

`image` (fichier image, obligatoire).

### Résultat/OCR confirmé

`merchant`, `date`, `amount`, `currency`, `category`, `description`, `raw_ocr_text`, `confidence`.

Seules les valeurs validées par l’utilisateur doivent créer une dépense.

## Store / preferences serializers

### Store

`id`, `name`, `location`, `initials`, `revenue`, `expenses`, `profit`, `inventory`.

Les trois premiers indicateurs doivent être calculés à partir des données comptables plutôt que modifiés directement.

### Preferences

`currency`, `language`, `theme`, `date_format`, `timezone`, `initial_capital`, `notifications`.

`notifications` contient : `email`, `low_stock`, `payments`, `weekly_summary`.

## Réponses API recommandées

- Les créations renvoient `201` et l’objet sérialisé créé.
- Les mises à jour renvoient `200` et l’objet complet.
- Les suppressions renvoient `204`.
- Les erreurs renvoient `400` avec les champs concernés, `401`, `403` ou `404` selon le cas.
- Les listes sont paginées : `count`, `next`, `previous`, `results`.
- Les opérations sensibles vérifient l’appartenance à l’entreprise courante côté serveur.

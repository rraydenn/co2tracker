## Conventions de messages de commit

---

## Objectif

Mettre en place une convention de commit **cohérente, lisible, et vérifiée automatiquement**.
Elle permet de :

- Garder un historique clair
- Identifier **le service concerné** par chaque changement
- Préparer des changelogs ou releases automatisés
- Éduquer tous les contributeurs à une rigueur professionnelle

---

## Format standard avec service (scope)

```bash
<type>(<scope>): description
```

- `type` : action effectuée (voir tableau ci-dessous)
- `scope` : nom du microservice concerné (ex: `backend`, `frontend`, `deploiment`)
- `description` : courte, claire, min. 10 caractères, sans point final

> Exemple :
>
> - `feat(backend): ajout du login avec JWT`
> - `fix(backend): corrige l’erreur 500 sur /me`

---

## Types de commits autorisés

| Type       | Description                               |
| ---------- | ----------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                   |
| `fix`      | Correction de bug                         |
| `docs`     | Documentation uniquement                  |
| `style`    | Formatage sans impact sur le comportement |
| `refactor` | Refactorisation sans ajout de feature     |
| `test`     | Ajout ou modification de tests            |
| `chore`    | Tâches annexes (build, maintenance, etc.) |
| `ci`       | Changements liés à l'intégration continue |
| `build`    | Configuration du build, Docker, scripts   |
| `perf`     | Optimisation de performance               |

---

## Scopes autorisés (services)

| Scope        | Service  |
| ------------ | -------- |
| `backend`    | api      |
| `frontend`   | frontend |
| `deploiment` | CI/CD    |

---

## Règles syntaxiques à respecter

| Règle                                     | Exemple incorrect                                       | Correction                             |
| ----------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| Min. 10 caractères dans la description    | `feat(backend): login`                                  | `feat(backend): ajoute login avec JWT` |
| Longueur max recommandée : 100 caractères | `feat(deploiment): très très long texte bla bla bla...` | à résumer                              |

---

## Template de message (optionnel)

Crée à la racine : `.gitmessage.txt`

```txt
type(scope): message descriptif clair (min 10 caractères)

# Exemples :
# feat(auth): ajoute endpoint /me
# fix(users): corrige erreur 500 sur /me
# docs(payments): met à jour la doc de configuration
```

Configurer Git :

```bash
git config commit.template .gitmessage.txt
```

---

## Tips pour bien commiter

Avant chaque commit :

```bash
git status
```

Pendant ton commit :

- Pense au **service concerné**
- Écris ton message comme si tu répondais à :
  _"Qu’est-ce que j’ai changé, et dans quel module ?"_

Si tu fais plusieurs choses → **sépare-les** en plusieurs commits propres.

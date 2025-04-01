# Comment utiliser les variables d'environnement dans le projet ?

## Configuration de la partie backend (API AdonisJS)

### 1. Installation de PostgreSQL

Nous utilisons **PostgreSQL** comme base de données. Installez-le sur votre machine, ainsi que le client `psql` (invite de commande). Consultez la documentation officielle pour plus de détails.

---

### 2. 👤 Création d'un utilisateur PostgreSQL

Après l'installation, ouvrez un terminal et exécutez la commande suivante :

```bash
psql postgres
```

Ensuite, créez un utilisateur avec un mot de passe sécurisé :

```sql
CREATE USER tracker_co2_user WITH PASSWORD 'mysecretpassword';
```

---

### 3. Création de la base de données

Créez une base de données dédiée au projet :

```sql
CREATE DATABASE tracker_co2;
```

---

### 4. Attribution des droits à l'utilisateur

Attribuez tous les privilèges sur la base de données à l'utilisateur créé précédemment :

```sql
GRANT ALL PRIVILEGES ON DATABASE tracker_co2 TO tracker_co2_user;
```

✅ La configuration de PostgreSQL est terminée.

---

### 5. Configuration de l'environnement api

1. Créez un fichier `.env.development` à la racine du projet api :

```bash
touch .env.development
```

2. Copiez le contenu de `.env.example` dans `.env.development` :

```bash
cp .env.example .env.development
```

3. Modifiez les variables d'environnement selon vos besoins :

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=debug
APP_KEY=GENEREZ-UNE-CLE-AVEC: node ace generate:key
NODE_ENV=development

DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=tracker_co2_user
DB_PASSWORD=mysecretpassword
DB_DATABASE=tracker_co2
```

4. Assurez-vous que les fichiers `.env` et `.env.development` sont bien ignorés par Git (via `.gitignore`).

---

## Configuration du frontend (Vite + Vue.js)

### 1. Création du fichier `.env.development`

Dans le dossier `frontend`, créez un fichier `.env.development` :

```bash
touch .env.development
```

Copiez les variables de `.env.example` et remplissez-les avec vos informations :

```env
VITE_PORT=3000
VITE_HOST=localhost

# API interne (backend AdonisJS)
VITE_API_BASE_URL=http://localhost:3333/api

# API externe (si applicable)
VITE_EXTERNAL_API_BASE_URL=https://api.example.com
VITE_EXTERNAL_API_KEY=

# Niveau de log
VITE_LOG_LEVEL=debug
```

ℹ️ Toutes les variables d'environnement pour le frontend doivent commencer par `VITE_`.

---

### 2. Utilisation des variables d'environnement dans le code

Pour accéder à une variable d'environnement dans le code, utilisez `import.meta.env` :

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiUrl); // Affiche l'URL de l'API
```

---

### 3. Exemple d'utilisation dans un composant Vue.js

```vue
<template>
	<div>
		<h1>Bienvenue sur le Tracker CO2</h1>
		<p>API URL: {{ apiUrl }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue';
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
</script>

<style scoped>
h1 {
	color: #42b983;
}
p {
	font-size: 1.2em;
}
</style>
```

---

## Ajouter une nouvelle variable d'environnement

1. Ajoutez la variable dans le fichier `.env.development` (backend ou frontend).
2. Si c'est pour le frontend, assurez-vous qu'elle commence par `VITE_`.
3. Ajoutez également la variable dans le fichier `.env.example` pour faciliter le partage avec l'équipe.

---

## Test de fonctionnement

1. Lancez le backend :

```bash
npm run dev
```

2. Lancez le frontend :

```bash
npm run dev
```

Vérifiez que tout fonctionne correctement.

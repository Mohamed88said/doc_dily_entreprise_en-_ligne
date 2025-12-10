# Site de Documentation

Site statique de documentation pour la Plateforme de Création d'Entreprises en Ligne.

## 📁 Structure

```
documentation/
├── index.html              # Page d'accueil
├── css/
│   └── style.css          # Styles principaux
├── js/
│   └── main.js           # Scripts JavaScript
├── docs/
│   ├── project-overview.html    # Documentation projet global
│   └── dily-architecture.html   # Documentation architecture Dily
├── README.md              # Documentation projet (Markdown)
├── README_DILY.md        # Documentation Dily (Markdown)
└── README_SITE.md        # Ce fichier
```

## 🚀 Déploiement sur GitHub Pages

### Méthode 1 : Via l'interface GitHub

1. **Créer un repository** sur GitHub
2. **Uploader les fichiers** de documentation
3. **Aller dans Settings** → **Pages**
4. **Sélectionner la branche** (généralement `main` ou `master`)
5. **Sélectionner le dossier** `/ (root)` ou `/docs` selon votre structure
6. **Sauvegarder**

Le site sera accessible à : `https://[votre-username].github.io/[nom-repo]/`

### Méthode 2 : Via GitHub Actions (Recommandé)

Créer un fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./documentation
```

### Méthode 3 : Via gh-pages (npm)

```bash
# Installer gh-pages
npm install --save-dev gh-pages

# Ajouter dans package.json
{
  "scripts": {
    "deploy": "gh-pages -d documentation"
  }
}

# Déployer
npm run deploy
```

## 🔧 Développement Local

### Option 1 : Serveur Python simple

```bash
cd documentation
python -m http.server 8000
```

Accéder à : `http://localhost:8000`

### Option 2 : Serveur Node.js (http-server)

```bash
# Installer http-server
npm install -g http-server

# Lancer
cd documentation
http-server -p 8000
```

### Option 3 : Live Server (VS Code)

Installer l'extension "Live Server" dans VS Code et cliquer sur "Go Live".

## 📝 Contenu

Le site contient :

- **Page d'accueil** (`index.html`) : Vue d'ensemble avec liens vers les sections
- **Projet Global** (`docs/project-overview.html`) : Documentation complète du projet
- **Architecture Dily** (`docs/dily-architecture.html`) : Documentation spécifique au template Dily

## 🎨 Personnalisation

### Modifier les couleurs

Éditer `css/style.css` et modifier les variables CSS :

```css
:root {
    --primary-color: #2563eb;
    --primary-dark: #1e40af;
    --secondary-color: #10b981;
    /* ... */
}
```

### Ajouter des pages

1. Créer un nouveau fichier HTML dans `docs/`
2. Utiliser la même structure que les pages existantes
3. Ajouter un lien dans la navigation (`index.html` et autres pages)

## 🔗 Liens

- **GitHub Pages** : [https://pages.github.com/](https://pages.github.com/)
- **Documentation GitHub Pages** : [https://docs.github.com/en/pages](https://docs.github.com/en/pages)

## 📄 Licence

Même licence que le projet principal.


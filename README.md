# 🌾 Agent IA Agricole — Abéché, Tchad

Système de recommandation de cultures et chatbot IA pour les agriculteurs d'Abéché.
Projet académique — Mémoire / Thèse.

---

## 📁 Structure du projet

```
agri_abeche/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── db.sqlite3          ← créé automatiquement
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
│       ├── auth_app/       ← login, register, JWT
│       ├── chatbot/        ← chatbot IA texte + image
│       ├── cultures/       ← recommandation ML
│       └── analyses/       ← historique
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.jsx
        ├── context/
        │   └── AuthContext.js
        ├── services/
        │   └── api.js
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Chat.jsx
            └── Cultures.jsx
```

---

## ⚙️ Installation

### 1. Backend Django

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer la clé API
cp .env.example .env
# Ouvrir .env et ajouter votre ANTHROPIC_API_KEY

# Initialiser la base de données
python manage.py makemigrations
python manage.py migrate

# Lancer le serveur
python manage.py runserver
```

Le backend démarre sur : http://localhost:8000

### 2. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le frontend
npm start
```

Le frontend démarre sur : http://localhost:3000

---

## 🔑 Obtenir une clé API Anthropic

1. Aller sur https://console.anthropic.com
2. Créer un compte et générer une clé API
3. Copier la clé dans le fichier `.env`

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

---

## 📡 API Endpoints

| Méthode | URL                              | Description                  | Auth |
|---------|----------------------------------|------------------------------|------|
| POST    | /api/auth/register/              | Créer un compte               | ❌   |
| POST    | /api/auth/login/                 | Se connecter (JWT)            | ❌   |
| GET     | /api/auth/me/                    | Profil utilisateur            | ✅   |
| POST    | /api/auth/logout/                | Déconnexion                   | ✅   |
| GET     | /api/chatbot/conversations/      | Liste des conversations       | ✅   |
| POST    | /api/chatbot/conversations/      | Créer une conversation        | ✅   |
| GET     | /api/chatbot/conversations/{id}/ | Détails + messages            | ✅   |
| DELETE  | /api/chatbot/conversations/{id}/ | Supprimer une conversation    | ✅   |
| POST    | /api/chatbot/envoyer/            | Envoyer message (texte+image) | ✅   |
| POST    | /api/cultures/recommander/       | Recommander des cultures      | ✅   |
| GET     | /api/cultures/liste/             | Liste toutes les cultures     | ✅   |
| GET     | /api/analyses/historique/        | Historique des analyses       | ✅   |

---

## 🤖 Fonctionnalités IA

- **Chatbot bilingue** : répond en français et en arabe
- **Analyse d'image** : détecte les maladies des plantes via photo
- **Recommandation de cultures** : basée sur mois, température, précipitations, sol, pH
- **Historique** : toutes les conversations sont sauvegardées par utilisateur

## 🌿 Cultures supportées

| Culture   | Arabe       | Saison     |
|-----------|-------------|------------|
| Mil       | دخن         | Hivernage  |
| Sorgho    | ذرة         | Hivernage  |
| Niébé     | لوبيا       | Hivernage  |
| Arachide  | فول سوداني  | Hivernage  |
| Sésame    | سمسم        | Hivernage  |
| Oignon    | بصل         | Sèche      |
| Tomate    | طماطم       | Sèche      |

---

## 🛠️ Technologies

- **Backend** : Python 3.10+, Django 4.2, Django REST Framework, JWT
- **Frontend** : React 18, React Router, Axios
- **IA** : Anthropic Claude API (texte + vision)
- **Base de données** : SQLite
- **Auth** : JWT (access token 24h, refresh 7 jours)

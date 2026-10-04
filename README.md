<div align="center">

# 🏡 CrownAtlas

### Real Estate Property Search and Management Platform

**A modern Next.js application with Trestle API integration, semantic search, and interactive maps.**

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![Node.js](https://img.shields.io/badge/Node.js-18.17+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Feature Setup Notes](#-feature-setup-notes)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**CrownAtlas** is a full-stack real estate platform that lets users discover, compare, and save properties. It pulls live listing data from CoreLogic's **Trestle API**, keeps it synchronized on a schedule, and presents it through a fast, responsive interface with advanced search and an interactive map.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🔍 **Property Search and Discovery** | Advanced filtering plus semantic search for natural-language queries |
| 🗺 **Interactive Maps** | Leaflet-based maps with drawing tools and property visualization |
| 🔐 **User Authentication** | Secure JWT-based sign-up, sign-in, and session management |
| ⚖️ **Property Comparison** | Side-by-side comparison of multiple listings |
| ❤️ **Saved Properties and Searches** | Profile area for favorites and reusable searches |
| 📱 **Responsive Design** | Mobile-first UI built with Tailwind CSS |
| 🔄 **Real-Time Data Sync** | Automatic synchronization with the Trestle API at a configurable interval |

---

## 🏗 Architecture

```
┌────────────────────┐     ┌──────────────────────────┐     ┌──────────────────┐
│   Browser (React)  │ ──► │  Next.js App Router      │ ──► │  Trestle API     │
│  Search · Map · UI │     │  UI pages + API routes   │     │  (CoreLogic)     │
└────────────────────┘     └────────────┬─────────────┘     └──────────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │  SQLite (better-sqlite3) │
                           │  Users · Saved items     │
                           └──────────────────────────┘
```

- **Frontend:** React pages and components rendered by the Next.js App Router.
- **Backend:** Next.js API routes for properties, authentication, and user profiles.
- **Data source:** Trestle API, accessed through OAuth with scheduled refreshes.
- **Storage:** an embedded SQLite database for user data, created automatically on first run.

---

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React, Tailwind CSS |
| Maps | Leaflet / React Leaflet, Google Maps (maps and Street View) |
| Database | SQLite via `better-sqlite3` |
| Authentication | JSON Web Tokens (JWT) |
| Data Provider | CoreLogic Trestle API |
| Search | Semantic search with vector indexing |

---

## 📋 Prerequisites

### Required Software

- **Node.js** 18.17 or higher
- **npm** (bundled with Node.js), or `yarn` / `pnpm`
- **Git**

### Required API Keys and Services

| Service | What you need | Used for |
| --- | --- | --- |
| **Trestle API (CoreLogic)** | API ID and password | Property data |
| **Google Maps Platform** | API key with **Maps JavaScript API** and **Street View Static API** enabled | Maps and street view |

### Database

No installation is needed. SQLite is handled by `better-sqlite3`, and the database file is created automatically.

---

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd back
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

All dependencies are defined in `package.json`.

### 3. Configure environment variables

Create **both** a `.env.local` file and a `.env` file in the project root, using the values in the next section.

### 4. Database setup

The SQLite database is created automatically the first time the app runs.

*Optional:* populate the database with sample data.

```bash
node populate-database.js
```

### 5. Verify the Trestle API connection *(optional)*

```bash
node test-trestle-api.js
```

---

## 🔐 Environment Variables

```env
# Trestle API (required)
TRESTLE_API_ID=your-trestle-api-id
TRESTLE_API_PASSWORD=your-trestle-api-password
TRESTLE_BASE_URL=https://api-trestle.corelogic.com/trestle
TRESTLE_OAUTH_URL=https://api-trestle.corelogic.com/trestle/oidc/connect/token
TRESTLE_UPDATE_INTERVAL=15

# Database
DATABASE_URL=./data/users.db

# Authentication
JWT_SECRET=use-a-long-random-string-of-at-least-32-characters

# Google Maps (required for maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.crowncoastalhomes.com
API_BASE_URL=https://api.crowncoastalhomes.com

# Environment
NODE_ENV=development
```

| Variable | Description |
| --- | --- |
| `TRESTLE_API_ID` / `TRESTLE_API_PASSWORD` | Credentials issued by CoreLogic Trestle |
| `TRESTLE_BASE_URL` / `TRESTLE_OAUTH_URL` | Trestle API and OAuth token endpoints |
| `TRESTLE_UPDATE_INTERVAL` | Property data sync interval, in minutes |
| `DATABASE_URL` | Path to the SQLite database file |
| `JWT_SECRET` | Secret used to sign tokens (32+ characters) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key exposed to the browser |
| `NEXT_PUBLIC_BASE_URL` | Public URL of this application |
| `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` | Base URL of the backend API |
| `NODE_ENV` | `development` or `production` |

> ⚠️ Never commit `.env` or `.env.local`. Generate a strong secret with `openssl rand -base64 48`.

---

## ▶️ Running the Application

### Development

```bash
npm run dev
```

The app starts at **http://localhost:3000**.

### Production build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
back/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── properties/       # Property listing pages
│   │   └── map/              # Map interface
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Buttons, forms, and base UI
│   │   ├── filters/          # Search and filter components
│   │   └── map/              # Map-related components
│   ├── lib/                  # Core libraries
│   │   ├── auth.ts           # Authentication logic
│   │   ├── database.ts       # Database operations
│   │   └── trestle-api.ts    # Trestle API integration
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles
├── data/                     # SQLite database files
└── package.json              # Dependencies and scripts
```

---

## 🔧 Development Workflow

### Before you start

1. Confirm all environment variables are configured.
2. Test the API connection with the provided scripts.
3. Optionally run the database population script.

### Common commands

```bash
# Start the dev server (Turbopack for faster builds)
npm run dev

# Regenerate the API client (when the API changes)
npm run generate-client

# Run database migrations
node run-migration.js

# Test specific features
node test-properties-api.js
node test-semantic-search.js
```

### Diagnostic scripts

| Script | Purpose |
| --- | --- |
| `test-trestle-api.js` | Test the Trestle API connection |
| `test-oauth-method.js` | Test OAuth authentication |
| `test-properties-api.js` | Test property data retrieval |
| `test-semantic-search.js` | Test semantic search |
| `debug-trestle-api.js` | Debug Trestle API issues |
| `verify-credentials.js` | Verify all API credentials |

---

## 🌐 Feature Setup Notes

**Maps.** Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and enable the required APIs in the Google Cloud Console.

**Property search.** Semantic search relies on vector indexing, which is handled automatically. Property data re-syncs on the interval set by `TRESTLE_UPDATE_INTERVAL`.

**Authentication.** JWTs manage sessions, and user records are stored in SQLite.

---

## 📚 API Reference

### Trestle API (external)

CrownAtlas uses CoreLogic's Trestle API for:

- Property search and filtering
- Property details and media
- Market statistics

### Internal API routes

| Route | Purpose |
| --- | --- |
| `/api/properties` | Property search and listing |
| `/api/auth` | Authentication endpoints |
| `/api/user` | User profile management |

---

## 🚀 Deployment

Set these in your production environment:

- `NODE_ENV=production`
- A strong, unique `JWT_SECRET`
- Valid Trestle and Google Maps credentials
- Production values for the application and API base URLs

Then build and start:

```bash
npm run build
npm run start
```

> **Note:** SQLite stores data in a local file, so the host needs a **persistent disk** for the `data/` directory. Serverless platforms with ephemeral file systems will lose data between deployments.

---

## 🛡 Security

- Use a long, random `JWT_SECRET` and rotate it if it is ever exposed.
- Keep `.env` and `.env.local` out of version control.
- Restrict your Google Maps API key by HTTP referrer and by API.
- Serve production traffic over HTTPS.

---

## 🧰 Troubleshooting

| Issue | What to check |
| --- | --- |
| **Trestle API connection fails** | Verify credentials, then run `test-trestle-api.js` and `verify-credentials.js` |
| **Maps do not load** | Confirm the Google Maps key is valid and the required APIs are enabled |
| **Database errors** | Check file permissions on the `data/` folder and database file |
| **Build errors** | Reinstall dependencies and confirm all environment variables are set |
| **OAuth problems** | Run `test-oauth-method.js` and `debug-trestle-api.js` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test with the provided scripts and run `npm run lint`
5. Submit a pull request

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Trestle API Documentation](https://trestle-documentation.corelogic.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Leaflet Documentation](https://react-leaflet.js.org/)

---

## 📄 License

This project is proprietary. Please contact the development team for licensing information.

<div align="center">

**CrownAtlas** · Find the right property, faster.

</div>

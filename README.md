# GrowthBridge

> Production-Grade Virtual Organization Platform powered by Next.js 15, Supabase, and the optional Kanyoza Autonomous Platform intelligence layer.

---

## 🏛️ Architecture Overview

GrowthBridge operates as an independent, modular monolith where **Supabase PostgreSQL** is the authoritative source of record for all business data, and **Next.js (Node.js)** serves the application. The **Kanyoza Autonomous Platform** provides an optional capability layer for AI, workflows, and autonomous agents.

```
                    GROWTHBRIDGE
                         │
             ┌───────────┴───────────┐
             │                       │
         NEXT.JS                 SUPABASE
       React + TS             PostgreSQL/Auth
             │                 Storage/RLS
             │                       │
             └───────────┬───────────┘
                         │
                 CORE APPLICATION
                         │
             ┌───────────┼───────────┐
             │           │           │
           CMS         Talent      Projects
             │           │           │
             └───────────┼───────────┘
                         │
               OPTIONAL INTEGRATION
                         │
                         ▼
             KANYOZA AUTONOMOUS PLATFORM
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
       AI             AGENTS          AUTOMATION
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 20.11.0
- npm >= 10.0.0
- A Supabase Project (PostgreSQL database)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 4. Database Setup
Apply the migrations in `supabase/migrations/` to your Supabase project in numerical order:
```bash
# Using Supabase CLI
supabase db push
```

### 5. Running the Application
```bash
# Development
npm run dev

# Typecheck & Lint
npm run typecheck
npm run lint

# Tests
npm test
```

---

## 📖 Documentation
Detailed technical documentation is available in the `docs/` folder:
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Database Schema & Migrations](docs/DATABASE.md)
- [Authentication & RBAC](docs/AUTHENTICATION.md)
- [Autonomous Platform Integration](docs/AUTONOMOUS_PLATFORM.md)
- [Deployment on Render](docs/DEPLOYMENT.md)
- [Security & Compliance](docs/SECURITY.md)

# GrowthBridge Architecture Guide

## 1. System Topology
GrowthBridge is designed as a standalone **modular monolith**:
- **Application Engine**: Next.js 15 App Router running on Node.js.
- **System of Record**: Supabase PostgreSQL with Row Level Security.
- **Session Layer**: Supabase Auth with SSR cookies.
- **Intelligence Layer**: Kanyoza Autonomous Platform (optional, decoupled).

## 2. Layered Domain Architecture
```
UI (React Components)
  ↓
Domain Services (src/services/*)
  ↓
Repositories (src/repositories/*)
  ↓
Supabase Database Client (src/lib/supabase/*)
```

## 3. Graceful Degradation
If `NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED=false` or if the external Autonomous Platform is unreachable, all core features (Public pages, CMS, Admin operations, Forms) continue operating without disruption.

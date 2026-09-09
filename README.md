# Entrepreneur SaaS

A high-end platform for validating, de-risking, and refining startup ideas through data-driven decisions.

## Monorepo Structure

```
/apps/web       — Next.js frontend (Supabase Auth, real-time dashboards)
/services/viability-engine — Python FastAPI microservice (scoring, analysis, NLP)
/supabase/migrations     — PostgreSQL schema migrations
```

## Core Modules

### 1. Market Validation
Scores a startup idea against real market data — TAM/SAM/SOM sizing, competitor density, trend signals, and customer intent. Answers: *Is this market worth entering?*

### 2. Dynamic Business Model Canvas (BMC)
A living BMC that evolves as you add evidence. Each of the 9 building blocks is scored, challenged, and linked to real metrics. Highlights contradictions and blind spots automatically.

### 3. Risk Matrix
Identifies, quantifies, and tracks every risk in your venture — market, technical, team, regulatory, financial. Produces a heat map and actionable mitigation tasks with deadlines.

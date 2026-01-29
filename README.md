# USTS
# USTS (Unified Smart IT Ticketing System) - Option A

## Requirements
- Node 18+
- PostgreSQL (Neon/Supabase/local)

## Setup
### 1) Install
npm install

### 2) Backend env
cp apps/api/.env.example apps/api/.env
# edit DATABASE_URL, JWT secrets, ORG_DOMAIN

### 3) Prisma migrate + seed
npm run prisma:migrate -w apps/api
npm run prisma:seed -w apps/api

### 4) Frontend env
cp apps/web/.env.example apps/web/.env

### 5) Run
npm run dev

- Web: http://localhost:5173
- API: http://localhost:4000/health

## Seeded users
- admin@powergrid.com / Admin123!
- agent@powergrid.com / Agent123!
- user@powergrid.com / User123!

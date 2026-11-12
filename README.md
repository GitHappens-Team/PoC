# Sonar PoC

## Quick start

Installare Docker e assicurarsi di avere il comando `docker` nel proprio PATH.

```bash
git clone <this repo> PoC && cd PoC
pnpm install
pnpm supabase:start
pnpm dev
```

## Primo avvio

Requisiti: Node 22+ (vedi `.nvmrc`), pnpm 10 (`corepack enable`) e Docker in esecuzione.

1. `pnpm install`
2. Creare un client OAuth su [Google Cloud Console](https://console.cloud.google.com/auth/) (tipo _Web application_)
   con redirect URI `http://127.0.0.1:54321/auth/v1/callback`.
3. Copiare `supabase/.env.example` in `supabase/.env` e inserire client ID e secret di Google.
4. `pnpm supabase:start` (il primo avvio scarica le immagini Docker e richiede qualche minuto).
5. Copiare `apps/web/.env.example` in `apps/web/.env.local`; i valori locali si leggono con
   `pnpm exec supabase status`.
6. `pnpm db:migrate`
7. `pnpm dev` e aprire **http://127.0.0.1:3000** (non `localhost`: i cookie di sessione
   e i redirect di Supabase usano `127.0.0.1`).

## Struttura

| Percorso         | Contenuto                                                                            |
| ---------------- | ------------------------------------------------------------------------------------ |
| `apps/web`       | App Next.js: landing, login (`(auth)`), area autenticata (`(app)`), `/auth/callback` |
| `packages/auth`  | Factory dei client Supabase (`@supabase/ssr`), senza dipendenze da Next.js           |
| `packages/db`    | Schema Drizzle, migrazioni SQL, client e helper `withRls`                            |
| `packages/brand` | `brand.json`: nome, testi e colori                                                   |
| `supabase`       | Configurazione dello stack Supabase locale (`config.toml`)                           |
| `scripts`        | Script di rebranding del template: non eseguirli finché il brand non è deciso        |

## Comandi

| Comando                                 | Cosa fa                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                              | Avvia l'app su http://127.0.0.1:3000                          |
| `pnpm build` · `lint` · `typecheck`     | Task Turbo su tutto il workspace                              |
| `pnpm supabase:start` · `supabase:stop` | Avvia/ferma lo stack Supabase locale (Studio su :54323)       |
| `pnpm supabase:reset`                   | Ricrea il database locale da zero (cancella anche gli utenti) |
| `pnpm db:generate`                      | Genera una migrazione dopo aver modificato lo schema          |
| `pnpm db:migrate`                       | Applica le migrazioni a `DATABASE_URL`                        |

## Autenticazione e accesso ai dati

- Login solo con Google tramite Supabase Auth (flusso PKCE): la server action di
  `sign-in` reindirizza a Google, `/auth/callback` scambia il codice con la sessione.
- `src/proxy.ts` rinnova i cookie di sessione a ogni richiesta e protegge `/dashboard`;
  le pagine verificano l'utente con `getSession()` / `requireSession()`.
- Gli utenti stanno in `auth.users` di Supabase. Le query fatte per conto di un utente
  passano da `withRls(db, claims, fn)`, che esegue la transazione con ruolo `authenticated`
  così le policy RLS vengono applicate; `createDb()` è la connessione privilegiata
  (migrazioni, scansioni).
- I secret non vanno mai nel repository: `supabase/.env` e `apps/web/.env.local` sono ignorati da git.

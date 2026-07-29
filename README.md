# MathComputers website

Vernieuwde website voor [mathcomputers.be](https://mathcomputers.be) met beheerpaneel.

## Functies

- **Publieke site** (NL): home, diensten, support, contact
- **Altijd zichtbaar**: adres, telefoon, openingsuren + open/gesloten-status
- **Extra sluitingsdagen / verlof** (beheerbaar)
- **Diensten & koeriers** beheerbaar (GLS, PostNL, Homerr, loterij, datarecuperatie, …)
- **Logo upload** via admin
- **Externe integraties**: TeamViewer, E-Shop, service-aanvraag, status herstelling
- **Contactformulier** met berichten in admin
- **Rollen**: Admin (gebruikers beheren) en Editor

## Starten

```bash
cd web
npm install
npm run db:setup    # database + seed
npm run dev
```

Open http://localhost:3000

### Admin login (na seed)

| Veld        | Waarde                    |
|-------------|---------------------------|
| URL         | http://localhost:3000/admin |
| E-mail      | `admin@mathcomputers.be`  |
| Wachtwoord  | `AdminMath2026!`          |

**Wijzig dit wachtwoord meteen** via Gebruikers in het adminpaneel.

## Scripts

| Script | Beschrijving |
|--------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Productie build |
| `npm run db:setup` | Schema push + seed |
| `npm run db:studio` | Prisma Studio |

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (lokaal; later PostgreSQL mogelijk)
- Auth.js (NextAuth) credentials

## Productie (OVH VPS)

Zie **[deploy/OVH-INSTALLATIE.md](deploy/OVH-INSTALLATIE.md)** — volledige stap-voor-stap.

Code bijwerken op de server:

```bash
./deploy/update.sh
```

Inhoud (uren, logo, diensten, berichten) beheer je in **/admin** — geen server nodig.

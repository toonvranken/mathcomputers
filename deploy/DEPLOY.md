# MathComputers live zetten (eigen server)

Deze handleiding vervangt de **oude WordPress-site** door de nieuwe Next.js-site op **mathcomputers.be**.

## Heb je een zware VPS nodig?

**Nee.** Deze site is licht:

| Resource | Ruim voldoende |
|----------|----------------|
| CPU | 1 vCPU |
| RAM | 1 GB (2 GB comfortabel) |
| Schijf | 10–20 GB SSD |
| Traffic | Klassieke winkel-site, geen zware load |

Je hoeft **geen** dure/zware VPS te nemen. Een **kleine** VPS met Node.js + Nginx is genoeg.

### Versio vs. iets anders

| Optie | Wanneer |
|-------|---------|
| **Huidige Versio VPS** | Prima als je al root/SSH hebt en Ubuntu/Debian kunt installeren. Bespaar migratie. |
| **Kleine VPS elders** (Hetzner, Contabo, OVH, …) | Vaak goedkoper/krachtiger voor dezelfde prijs. Alleen verhuizen als Versio te duur/traag/beperkt is. |
| **Shared hosting zonder Node** | Meestal **niet** geschikt (klassieke PHP-only hosting). Next.js heeft Node nodig. |
| **Cloudflare** | Jij hebt dit al → perfect voor DNS + HTTPS-proxy + botbescherming. Origin mag een klein VPS-IP zijn. |

**Advies:** start op de **kleinste bruikbare VPS** (of je huidige Versio als die Node aankan). Opschalen kan later altijd.

---

## Wat je nodig hebt

- Linux VPS (Ubuntu 22.04/24.04 is ideaal) — **1 vCPU / 1–2 GB RAM is genoeg**
- Root of sudo
- Domein **mathcomputers.be** (DNS via **Cloudflare**)
- Node.js **20 LTS of nieuwer**
- Nginx
- PM2 (`npm i -g pm2`)

---

## 1. Server voorbereiden

```bash
# Node 20 via NodeSource of nvm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git build-essential

# native modules (better-sqlite3)
sudo apt-get install -y python3 make g++

sudo npm i -g pm2
```

## 2. Code op de server

```bash
sudo mkdir -p /var/www/mathcomputers
sudo chown $USER:$USER /var/www/mathcomputers
cd /var/www/mathcomputers

# Optie A: git clone (aanbevolen)
git clone <jouw-repo-url> .

# Optie B: rsync / SFTP van je PC
# rsync -avz --exclude node_modules --exclude .next ./web/ user@server:/var/www/mathcomputers/

cd /var/www/mathcomputers   # of .../web als je monorepo clone't
# Zorg dat package.json hier staat (de map "web")
```

## 3. Omgeving & database

```bash
cp .env.example .env
nano .env
```

Vul minstens in:

```env
DATABASE_URL="file:./data/prod.db"
AUTH_SECRET="<plak hier: openssl rand -base64 32>"
AUTH_URL="https://mathcomputers.be"
NODE_ENV="production"
PORT=3000
```

```bash
mkdir -p data public/uploads
npm ci
npx prisma db push
npx prisma db seed
npm run build
```

**Admin na seed:** `admin@mathcomputers.be` / `AdminMath2026!`  
→ log meteen in op `/admin` en **wijzig wachtwoord**.

## 4. PM2 starten

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # volg de geprinte sudo-opdracht
```

Test lokaal op de server:

```bash
curl -I http://127.0.0.1:3000
```

## 5. Nginx + HTTPS

```bash
sudo cp deploy/nginx-mathcomputers.conf /etc/nginx/sites-available/mathcomputers.be
sudo ln -sf /etc/nginx/sites-available/mathcomputers.be /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mathcomputers.be -d www.mathcomputers.be
```

## 6. Oude site vervangen (cutover)

### Voorbereiding (geen downtime-risico)

1. Zet de nieuwe site eerst op een **tijdelijk subdomein** of secondair IP, bv.  
   `nieuw.mathcomputers.be` → test alles (formulier, admin, TeamViewer-links, logo).
2. Maak een **backup van de oude WordPress** (bestanden + DB) bij je huidige host.
3. Noteer alle e-mail / DNS records (MX mag niet wijzigen als mail elders loopt!).

### DNS omschakelen

| Record | Waarde |
|--------|--------|
| **A** `mathcomputers.be` | IP van je nieuwe server |
| **A** of **CNAME** `www` | zelfde IP of `mathcomputers.be` |
| **MX** | **niet aanraken** tenzij mail ook verhuist |

TTL eventueel 5 minuten zetten de dag vóór de switch.

### Als oude site op dezelfde server stond

- Stop/verwijder de oude vhost (Apache/Nginx WordPress).
- Laat alleen de nieuwe Nginx-config naar poort 3000 wijzen.
- Verplaats oude map bv. naar `/var/www/mathcomputers-old-backup`.

### Cloudflare (jij hebt dit al)

1. **A-record** `mathcomputers.be` → IP van je VPS, **oranje wolk (proxied)** aan.
2. `www` CNAME of A, ook proxied.
3. SSL/TLS-modus: **Full (strict)** (Let's Encrypt op de origin).
4. Security → **Bot Fight Mode** aan (extra spam/bot-filter).
5. Optioneel: WAF rate limit op POST naar `/contact`.
6. **MX-records niet wijzigen** als mail elders loopt.

## 7. Checklist na go-live

- [ ] https://mathcomputers.be laadt (geen mixed content)
- [ ] www redirect werkt
- [ ] Telefoon / uren / logo kloppen
- [ ] TeamViewer-knop opent juiste URL
- [ ] E-Shop, service-aanvraag, status-herstelling openen
- [ ] Contactformulier: testbericht verschijnt in `/admin/messages`
- [ ] Admin login + wachtwoord gewijzigd
- [ ] Extra sluitingsdag testen
- [ ] Google Search Console: sitemap indienen (`/sitemap.xml`)
- [ ] Oude WordPress-cache/CDN legen indien nog actief

## 8. Updates later

```bash
cd /var/www/mathcomputers
git pull
npm ci
npx prisma db push
npm run build
pm2 restart mathcomputers
```

## 9. Back-ups

Minimaal dagelijks:

```bash
# database + uploads
tar czf ~/backup-mc-$(date +%F).tgz data public/uploads .env
```

Of rsync naar een tweede schijf/NAS.

---

## Contactberichten: waar komen ze terecht?

1. **Altijd** in het adminpaneel: `/admin/messages` (archief + “Beantwoorden per e-mail”).
2. **Optioneel e-mailmelding** naar je winkelmailbox als je SMTP in `.env` zet  
   (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_NOTIFY_TO`).  
   Die mail heeft **Reply-To = de klant** → in Outlook/Gmail gewoon *Beantwoorden*.

Zonder SMTP werkt de site wél, maar je moet af en toe admin openen (of een bookmark/melding) om nieuwe berichten te zien. Met SMTP word je actief verwittigd.

---

## Spambeveiliging (ingebouwd)

| Maatregel | Wat het doet |
|-----------|----------------|
| Honeypot-veld | Bots vullen een verborgen veld → bericht genegeerd |
| Tijdscheck | Formulier < 3 sec = bot |
| Rate limit | Max 5 berichten / IP / 15 min |
| Contentfilter | Duidelijke spam-patterns worden genegeerd |
| SafeEmail | E-mailadres niet plain in eerste HTML-snapshot |
| robots.txt | `/admin` en `/api` geblokkeerd voor crawlers |
| Cloudflare (optioneel) | Extra bot/WAF-laag |

**Tip:** Zet in je mailbox ook een filter; het formulier slaat berichten in de database op (admin), het stuurt standaard geen open SMTP-mail (minder spam-open relay risico).

## Hulp nodig bij jouw concrete host?

Stuur door:

1. OS (Ubuntu/Debian/Windows Server?)
2. Heb je root/SSH?
3. Staat de oude site bij Combell / one.com / eigen VPS / …?
4. Lopen e-mail en website op dezelfde server?

Dan kan de procedure exact op jouw setup worden afgestemd.

# MathComputers op OVH VPS — stap voor stap

Voor: **OVH VPS-1** (of gelijkaardig) met **Ubuntu 22.04 / 24.04**.  
Doel: site live op **https://mathcomputers.be** via **Cloudflare**.

---

## Overzicht

| Fase | Wat |
|------|-----|
| A | Eerste login & beveiliging |
| B | Software (Node, Nginx, PM2, Certbot) |
| C | Code op de server |
| D | Database, `.env`, build |
| E | PM2 + Nginx + SSL |
| F | Cloudflare DNS |
| G | Checklist & updates |

**Geschatte tijd:** 45–90 minuten bij eerste keer.

---

## Wat je klaarzet

- [ ] OVH VPS IP-adres (bv. `51.x.x.x`)
- [ ] SSH root-wachtwoord of sleutel (uit OVH-mail / control panel)
- [ ] Code van dit project (git-repo **of** zip/rsync vanaf je PC)
- [ ] Cloudflare login (domein mathcomputers.be)
- [ ] Optioneel: SMTP-gegevens voor contactmails

---

# Fase A — Eerste login & basisbeveiliging

### A1. Inloggen via SSH (vanaf je Windows-PC)

**PowerShell** of **Windows Terminal**:

```powershell
ssh root@JOUW_VPS_IP
```

Eerste keer: typ `yes` bij de fingerprint.  
Wachtwoord plakken (vaak niet zichtbaar tijdens typen) → Enter.

> Geen root? Probeer `ubuntu@JOUW_VPS_IP` en daarna `sudo -i`.

### A2. Systeem bijwerken

```bash
apt update && apt upgrade -y
```

### A3. Firewall (UFW)

```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### A4. (Aanbevolen) aparte gebruiker i.p.v. altijd root

```bash
adduser deploy
usermod -aG sudo deploy
# Kopieer je SSH-key of stel wachtwoord in
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy 2>/dev/null || true
```

Verder in deze gids: commando’s als **root** of met `sudo`.  
App-map: `/var/www/mathcomputers`.

---

# Fase B — Node.js, build-tools, Nginx, PM2

### B1. Basispakketten

```bash
apt install -y curl git build-essential python3 nginx
```

### B2. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # v20.x
npm -v
```

### B3. PM2 (houdt de site draaiende na reboot)

```bash
npm install -g pm2
```

---

# Fase C — Code op de server zetten

Kies **één** methode.

### Optie 1 — Git (aanbevolen)

Op de server:

```bash
mkdir -p /var/www
cd /var/www
git clone JOUW_GIT_URL mathcomputers
# Als de Next-app in de map "web" zit:
#   cd mathcomputers/web
# Als package.json in de root van de clone zit:
#   cd mathcomputers
```

> Nog geen Git-repo? Maak er één op GitHub/GitLab (private), of gebruik optie 2.

### Optie 2 — Upload vanaf je Windows-PC (rsync / scp)

Op je **PC** (in de map waar `package.json` staat, dus meestal `...\MathComputers\web`):

```powershell
# OpenSSH scp (Windows 10/11)
scp -r . root@JOUW_VPS_IP:/var/www/mathcomputers
```

Of met WinSCP / FileZilla: upload de inhoud van `web/` naar `/var/www/mathcomputers`  
(**niet** de hele `node_modules` uploaden — die installeer je op de server).

Op de server daarna:

```bash
mkdir -p /var/www/mathcomputers
# bestanden staan nu in /var/www/mathcomputers
cd /var/www/mathcomputers
```

### Controle

```bash
cd /var/www/mathcomputers
ls package.json prisma src
```

Als `package.json` in een submap `web` zit:

```bash
cd /var/www/mathcomputers/web
```

**Alle volgende commando’s in de map met `package.json`.**

---

# Fase D — Omgeving, database, build

### D1. Mappen & rechten

```bash
mkdir -p data public/uploads
chmod 755 data public/uploads
```

### D2. `.env` aanmaken

```bash
cp .env.example .env
nano .env
```

Minimaal invullen:

```env
DATABASE_URL="file:./data/prod.db"
AUTH_SECRET="PLAK_HIER_EEN_LANGE_RANDOM_STRING"
AUTH_URL="https://mathcomputers.be"
NODE_ENV="production"
PORT=3000
```

Secret genereren:

```bash
openssl rand -base64 32
```

Plak de output als `AUTH_SECRET`.  
Optioneel SMTP-blok toevoegen (zie `.env.example`) voor mail bij contactberichten.

Opslaan in nano: `Ctrl+O`, Enter, `Ctrl+X`.

### D3. Dependencies, database, seed, build

```bash
npm ci
npx prisma db push
npx prisma db seed
npm run build
```

Bij succes zie je o.a. `✓ Compiled successfully` / routes-overzicht.

**Admin na seed:**

| | |
|--|--|
| URL | `https://mathcomputers.be/admin` (na DNS) of tijdelijk via IP + poort |
| E-mail | `admin@mathcomputers.be` |
| Wachtwoord | `AdminMath2026!` |

→ **Direct wijzigen** na eerste login.

---

# Fase E — PM2 + Nginx + HTTPS

### E1. App starten met PM2

```bash
# in de map met package.json / ecosystem.config.cjs
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs mathcomputers --lines 30
```

Test lokaal op de server:

```bash
curl -I http://127.0.0.1:3000
```

Verwacht: `HTTP/1.1 200` (of 307/308).

PM2 na reboot:

```bash
pm2 save
pm2 startup
# Voer de geprinte "sudo env PATH=..." regel exact uit
```

### E2. Nginx reverse proxy

```bash
nano /etc/nginx/sites-available/mathcomputers.be
```

Plak (pas niets aan tenzij je poort anders is):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name mathcomputers.be www.mathcomputers.be;

    client_max_body_size 5m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Activeren:

```bash
ln -sf /etc/nginx/sites-available/mathcomputers.be /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### E3. SSL op de VPS (Let’s Encrypt)

Twee gangbare setups met Cloudflare:

**A) Cloudflare SSL = Full (strict)** → certificaat op de origin (VPS) nodig:

```bash
apt install -y certbot python3-certbot-nginx
# Tijdelijk: Cloudflare DNS proxy grijs (DNS only) OF gebruik DNS-challenge
# Eenvoudigste eerste keer: A-record even "DNS only" (grijs wolkje), dan:
certbot --nginx -d mathcomputers.be -d www.mathcomputers.be
```

Daarna in Cloudflare weer **oranje wolk** + SSL mode **Full (strict)**.

**B) Cloudflare Flexible** — sneller proberen maar **minder veilig** (niet aanbevolen voor productie).

---

# Fase F — Cloudflare DNS (cutover)

1. Cloudflare → domein **mathcomputers.be** → **DNS**
2. **A-record** `@` → IP van je OVH VPS → Proxy **aan** (oranje)
3. **A** of **CNAME** `www` → zelfde IP of `@` → Proxy aan
4. **MX-records niet wijzigen** (e-mail blijft waar die nu is)
5. SSL/TLS → **Full (strict)**
6. Security → Bot Fight Mode aan (aanbevolen)

Wacht 1–5 minuten (soms langer). Test:

- https://mathcomputers.be  
- https://mathcomputers.be/admin  
- Contactformulier  
- TeamViewer / E-Shop links  

**Oude site:** pas DNS omzetten als de nieuwe site op de VPS goed werkt (eventueel eerst testen met hosts-file of tijdelijk subdomein `nieuw.mathcomputers.be`).

---

# Fase G — Checklist go-live

- [ ] Site laadt op https
- [ ] www → apex (of omgekeerd) werkt
- [ ] Adres / telefoon / uren kloppen
- [ ] Logo uploaden in admin
- [ ] Admin-wachtwoord gewijzigd
- [ ] Contactformulier → `/admin/messages` (+ optioneel e-mail)
- [ ] PM2: `pm2 status` = online
- [ ] `pm2 startup` gedaan
- [ ] Backup: zie hieronder

### Simpele backup (cron, dagelijks)

```bash
crontab -e
```

Regel toevoegen (pas pad aan):

```cron
15 3 * * * tar czf /root/backup-mc-$(date +\%F).tgz -C /var/www/mathcomputers data public/uploads .env 2>/dev/null
```

---

# Updates: hoe werkt dat?

Er zijn **twee soorten updates** — die moet je niet door elkaar halen.

## 1. Inhoud (uren, logo, diensten, teksten, gebruikers)

| | |
|--|--|
| **Waar?** | `/admin` in de browser |
| **Moeilijkheid** | Makkelijk — geen server nodig |
| **Downtime** | Geen |

Dit is al de “update module”: CMS in admin.

## 2. Code (nieuwe features, bugfixes, beveiliging)

| | |
|--|--|
| **Waar?** | Op de VPS via Git + script |
| **Moeilijkheid** | Eén commando na de eerste setup |
| **Downtime** | Meestal enkele seconden (PM2 restart) |

### Waarom géén “Update”-knop in admin?

- Zou de server moeten laten **git pull + build + restart** als de website-gebruiker
- Groot **beveiligingsrisico** (als admin-login lekt, heeft een aanvaller de hele server)
- Builds kunnen **falen** of de site kapot zetten zonder SSH om te herstellen
- Daarom: updates via SSH + script (of later CI/CD), niet via de website

### Update uitvoeren (na code-wijziging)

In de app-map op de server:

```bash
# Eenmalig uitvoerbaar maken
chmod +x deploy/update.sh

# Elke update:
./deploy/update.sh
```

Of handmatig:

```bash
git pull
npm ci
npx prisma db push
npm run build
pm2 restart mathcomputers
```

**Inhoud** (berichten, diensten, …) blijft bewaard in `data/prod.db`.  
Alleen **code** wordt vernieuwd.

---

# Handige commando’s

```bash
pm2 status
pm2 logs mathcomputers
pm2 restart mathcomputers
systemctl status nginx
nginx -t && systemctl reload nginx
df -h          # schijfruimte
free -h        # geheugen
```

---

# Problemen

| Probleem | Check |
|----------|--------|
| `502 Bad Gateway` | `pm2 status` — app down? `curl 127.0.0.1:3000` |
| Site niet bereikbaar | Firewall UFW, OVH firewall, Cloudflare proxy, juist A-record |
| SSL-fout Cloudflare | Full (strict) + geldig cert op VPS, of tijdelijk Full |
| `better-sqlite3` build error | `apt install build-essential python3` en opnieuw `npm ci` |
| Permission denied op `data/` | `chown -R` juiste user, `chmod` op `data` en `uploads` |
| Seed faalt | `DATABASE_URL` en map `data/` bestaat |

---

# Klaar?

Stuur bij vastlopers:

1. Output van `pm2 status` en `pm2 logs mathcomputers --lines 40`
2. Of je Ubuntu 22/24 gebruikt
3. Of de code via git of upload staat

Dan kunnen we gericht debuggen.

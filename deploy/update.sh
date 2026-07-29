#!/usr/bin/env bash
# MathComputers — code-update op de VPS
# Gebruik (in de map met package.json):
#   chmod +x deploy/update.sh
#   ./deploy/update.sh
set -euo pipefail

cd "$(dirname "$0")/.."
APP_NAME="${PM2_APP_NAME:-mathcomputers}"

echo "==> MathComputers update ($(pwd))"

if [ -d .git ]; then
  echo "==> git pull"
  git pull --ff-only
else
  echo "==> Geen git-repo — sla pull over (upload bestanden manueel en run dit script opnieuw)"
fi

echo "==> npm ci"
npm ci

echo "==> prisma db push (schema sync, data blijft)"
npx prisma db push

echo "==> build"
npm run build

if command -v pm2 >/dev/null 2>&1; then
  echo "==> pm2 restart ${APP_NAME}"
  pm2 restart "${APP_NAME}"
  pm2 status "${APP_NAME}"
else
  echo "==> PM2 niet gevonden — start de app manueel"
fi

echo "==> Klaar. Inhoud (DB) is behouden; code is bijgewerkt."

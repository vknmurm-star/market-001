#!/bin/bash
# Автодеплой market-store на VDS. Защита от параллельного запуска через flock
# (cron дёргает проверку каждые 2 минуты).
exec 200>/tmp/deploy-market-store.lock
flock -n 200 || { echo "$(date): деплой уже выполняется, пропускаю"; exit 1; }

set -e
cd /var/www/market-store

echo "=== Сохранение локальных правок (если есть) ==="
git stash

echo "=== Обновление кода из GitHub ==="
git pull origin master

echo "=== Восстановление локальных правок ==="
git stash pop || true

echo "=== Установка зависимостей ==="
npm install

echo "=== Чистая сборка (удаляем .next во избежание stale client manifest) ==="
rm -rf .next
npm run build

echo "=== Перезапуск сайта ==="
pm2 restart market-store

echo "=== Готово! $(date) ==="

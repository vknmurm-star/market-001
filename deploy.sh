#!/bin/bash
# Ручной (запасной) деплой market-store на noemi. Основной путь: автодеплой
# /root/bin/site-autodeploy.sh по пушу в master (cron раз в 2 минуты), этот скрипт
# cron'ом не вызывается.
# Берёт те же блокировки, что и автодеплой:
#   /run/lock/autodeploy-market-store.lock  не пересекается с автодеплоем магазина;
#   /run/lock/autodeploy-build.lock         общая очередь: на сервере одновременно идёт одна сборка.
exec 200>/run/lock/autodeploy-market-store.lock
flock -n 200 || { echo "$(date): деплой market-store уже выполняется (автодеплой или ручной), пропускаю"; exit 1; }
exec 201>/run/lock/autodeploy-build.lock
if ! flock -n 201; then
  echo "$(date): идёт сборка другого сайта, жду очереди (до 60 минут)..."
  flock -w 3600 201 || { echo "$(date): не дождался очереди сборки, выхожу"; exit 1; }
fi

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
# Повтор при разовом сбое (например, fetch шрифтов next/font с Google Fonts).
npm run build || { echo "Сборка упала — повторяю попытку…"; sleep 3; rm -rf .next; npm run build; }

echo "=== Перезапуск сайта ==="
pm2 restart market-store

echo "=== Готово! $(date) ==="

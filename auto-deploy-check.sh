#!/bin/bash
# Запускает деплой только при появлении новых коммитов в origin/main.
cd /var/www/market-store
git fetch origin master
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): новые изменения, деплою..." >> /var/log/market-store-autodeploy.log
    /var/www/market-store/deploy.sh >> /var/log/market-store-autodeploy.log 2>&1
fi

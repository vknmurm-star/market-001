# Деплой «Beauty» (market-001) на beauty.an51.su

Сайт работает на VDS **noemi** (IP 139.100.232.115, Ubuntu 24.04, SSH-алиас
`noemi`). Сервер общий: на нём же другие проекты, их не трогаем. Ниже: как
выкатывать обычные изменения и как поднять сайт с нуля (восстановление или
новый сервер). Актуальная сводка параметров лежит в `CLAUDE.md`.

## Обычный деплой

Деплой делается пушем в ветку `master`. Cron на сервере каждые 2 минуты
запускает `/root/bin/site-autodeploy.sh /var/www/market-store master market-store 3001`
(лог `/var/log/autodeploy-market-store.log`):

1. `git fetch`, затем только fast-forward (локальные правки на сервере или
   переписанная история блокируют деплой, нужен человек);
2. `npm ci`, если изменился `package-lock.json`;
3. `npm run build` (1 повтор при сбое);
4. `pm2 restart market-store --update-env` и проверка порта 3001 через curl.

Если сборка упала дважды, скрипт откатывает на прежний коммит и не пересобирает
упавший, пока в ветке не появится новый. Во время рестарта сайт 2-3 секунды
отдаёт 502.

Старые `deploy.sh` и `auto-deploy-check.sh` в корне репозитория cron больше не
использует.

### Кэш картинок next/image
Каталог `.next` при деплое не удаляется, поэтому кэш оптимизированных картинок
`/var/www/market-store/.next/cache/images` (TTL 4 часа) переживает деплои. Если
вы заменили картинки с теми же именами (`public/images/design/*`,
`public/images/products/*`), после деплоя очистите кэш на сервере:
```bash
rm -rf /var/www/market-store/.next/cache/images
```
Новые имена файлов чистки не требуют. Если после добавления роутов сайт отдаёт
странный 500 (stale client manifest), помогает `rm -rf .next` и пересборка.

## Установка с нуля

### 1. DNS
A-запись `beauty.an51.su` на IP сервера noemi (139.100.232.115).

### 2. Сервер: Node 24 (важно)
`node:sqlite` требует Node ≥ 22.5, Node 20 не подойдёт:
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs git nginx
node -v   # должно быть v24.x
```

### 3. Клонирование и сборка
Репозиторий `vknmurm-star/market-001`, ветка `master`. На сервере используется
deploy-ключ через ssh-алиас (`git@github-market-001:vknmurm-star/market-001.git`).
```bash
mkdir -p /var/www && cd /var/www
git clone git@github-market-001:vknmurm-star/market-001.git market-store
cd market-store
npm ci
```
Создать `.env.local` (по образцу `.env.local.example`, не в git):
```
SITE_URL=https://beauty.an51.su
ADMIN_PASSWORD=<надёжный пароль>
SESSION_SECRET=<длинная случайная строка>
SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=... SMTP_FROM=... ADMIN_EMAIL=...
```
Затем `npm run build`. БД `data/market.db` создаётся и засевается автоматически
при первом запуске (24 товара из seed.json). Каталог `data/` в .gitignore и
переживает деплои. Загруженные в админке файлы лежат в `public/uploads/` (тоже
вне git).

### 4. PM2 (порт 3001)
```bash
npm install -g pm2
cd /var/www/market-store
PORT=3001 pm2 start npm --name market-store -- start
pm2 save
pm2 startup   # выполнить показанную команду
```
Порты других сайтов на сервере заняты (3000, 3002, 3003, 3012), порт 3001 за
market-store менять нельзя.

### 5. nginx + HTTPS (443)
Отдельный конфиг сайта: reverse proxy на `localhost:3001` с заголовками
`X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto` (они нужны антиспаму по IP).
```bash
nginx -t && systemctl reload nginx
apt install -y python3-certbot-nginx
certbot --nginx -d beauty.an51.su
```
На сервере уже несколько сайтов на 443 через nginx (SNI), порт освобождать не
нужно, чужие конфиги не трогаем.

### 6. Автодеплой
Добавить в cron строку (скрипт `/root/bin/site-autodeploy.sh` общий для сайтов
сервера):
```
*/2 * * * * /root/bin/site-autodeploy.sh /var/www/market-store master market-store 3001
```

## Проверка после деплоя
- https://beauty.an51.su: главная, каталог, карточка товара, корзина, оформление
  открываются без ошибок, фото на месте;
- тестовый заказ → страница подтверждения с номером (оплата в тестовом режиме);
- `/admin` открывается по ADMIN_PASSWORD, товары и заказы;
- `/robots.txt` и `/sitemap.xml` отдаются с `https://beauty.an51.su`;
- `pm2 describe market-store` показывает `online`, в
  `/var/log/autodeploy-market-store.log` последняя запись «готово».

## SEO-верификация
Добавить https://beauty.an51.su в Google Search Console и Яндекс.Вебмастер,
подтвердить мета-тегом (`metadata.verification` в `src/app/layout.tsx`),
отправить `sitemap.xml`.

## Правила
Любая работа по SSH на сервере и любые слияния в `master` делаются только с
явного подтверждения владельца (см. раздел «Правила безопасности» в `CLAUDE.md`).

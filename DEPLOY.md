# Деплой «Маркет» на market.an51.su — чеклист

Проект готов к развёртыванию. Ниже — шаги, требующие вашего доступа к
инфраструктуре (SSH к VDS, DNS-панель Timeweb, аккаунт GitHub). Порядок — по
skill `vds-nextjs-deploy`, с отличиями этого проекта (Node 24, без Decap/OAuth).

## 1. DNS (Timeweb)
Создать A-запись для поддомена **market** → IP сервера kvm.an51.su
(тот же IP, что у beauty.an51.su). TTL по умолчанию.

## 2. GitHub-репозиторий
Локальный git уже инициализирован, есть первый коммит. Создайте пустой репозиторий
(например `market-store`) и запушьте:
```bash
git remote add origin git@github.com:<ваш-логин>/market-store.git
git branch -M main
git push -u origin main
```
OAuth-приложение GitHub НЕ нужно (в отличие от site-001) — здесь нет Decap CMS.

## 3. Сервер: Node 24 (важно!)
`node:sqlite` требует Node ≥ 22.5 — Node 20 из чеклиста skill НЕ подойдёт:
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs git nginx
node -v   # должно быть v24.x
```

## 4. Клонирование и сборка
```bash
mkdir -p /var/www && cd /var/www
git clone git@github.com:<ваш-логин>/market-store.git
cd market-store
npm install
```
Создать `.env.local` (по образцу `.env.local.example`):
```
SITE_URL=https://market.an51.su
ADMIN_PASSWORD=<надёжный пароль>
```
Затем:
```bash
npm run build
```
БД `data/market.db` создаётся и засевается автоматически при первом запуске
(24 товара из seed.json). Каталог `data/` в .gitignore — переживает деплои.

## 5. PM2
```bash
npm install -g pm2
pm2 start npm --name market-store -- start
pm2 save
pm2 startup   # выполнить показанную команду
```

## 6. nginx + HTTPS (443)
Конфиг `/etc/nginx/sites-available/market-store` — reverse proxy на
`localhost:3000` с заголовками `X-Forwarded-*` (шаблон в skill, раздел 5).
```bash
ln -s /etc/nginx/sites-available/market-store /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
apt install -y python3-certbot-nginx
certbot --nginx -d market.an51.su
```
На VDS уже несколько сайтов на 443 через nginx (SNI) — конфликта с beauty.an51.su
нет, порт освобождать не нужно.

## 7. Автодеплой (cron)
```bash
chmod +x deploy.sh auto-deploy-check.sh
crontab -e
# добавить строку:
*/2 * * * * /var/www/market-store/auto-deploy-check.sh
```

## 8. Проверка
- https://market.an51.su — главная, каталог, карточка товара
- Оформить тестовый заказ → страница подтверждения с номером
- /admin — вход по ADMIN_PASSWORD, товары и заказы
- /robots.txt и /sitemap.xml отдаются с https://market.an51.su

## 9. SEO-верификация (после запуска)
Добавить ресурс https://market.an51.su в Google Search Console и
Яндекс.Вебмастер, подтвердить мета-тегом (можно добавить в
`metadata.verification` в `src/app/layout.tsx`), отправить sitemap.xml.

---
Что я не могу сделать сам и оставляю вам: доступ по SSH к серверу, DNS в Timeweb,
создание и пуш в GitHub-репозиторий под вашим аккаунтом. Как только дадите
доступ или выполните шаги 1–2 — могу продолжить настройку удалённо, если
подключите терминал к серверу.

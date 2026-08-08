# Продакшен-конфигурация проекта «Маркет» (market-001)

Интернет-магазин косметики на Next.js 16 + SQLite (`node:sqlite`), развёрнут на
собственном VDS (kvm.an51.su, домен **market.an51.su**) по паттерну site-001,
но со своими отличиями. При изменениях сохраняй логику ниже — не хардкодь то,
что должно браться из окружения.

## 1. Стек и ключевое отличие от site-001

- Next.js 16 (App Router) + Tailwind 4 + TypeScript, PM2, nginx, certbot 443.
- **БД — SQLite через встроенный `node:sqlite`, НЕ better-sqlite3.** Нативная
  сборка better-sqlite3 недоступна на dev-машине (нет Visual Studio), а
  `node:sqlite` не требует компиляции.
- **На сервере нужен Node 22.5+ / 24, а НЕ Node 20** (в Node 20 модуля
  `node:sqlite` нет). Это отличие от чеклиста skill — там ставится Node 20.
  Ставить: `curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt install -y nodejs`.
- **CMS нет.** Вместо публичной Decap CMS — собственная закрытая CRUD-админка
  на `/admin` (вход по паролю). Значит, GitHub OAuth-приложение и
  `public/admin/config.yml` для этого проекта НЕ нужны.

## 2. Переменные окружения (`.env.local` на сервере, НЕ в git)

```
SITE_URL=https://market.an51.su
ADMIN_PASSWORD=<надёжный пароль администратора>
SESSION_SECRET=<длинная случайная строка для подписи сессий покупателей>
# SMTP (письма покупателям) — без них письма просто не отправляются:
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=465
SMTP_USER=market@an51.su
SMTP_PASS=<app-пароль ящика>   # секрет вписывает владелец, не Claude
SMTP_FROM=market@an51.su
ADMIN_EMAIL=market@an51.su
# DATABASE_PATH=/var/www/market-store/data/market.db   # опционально
```

Почта (`src/lib/mailer.ts`, `src/lib/emails.ts`): отправка best-effort через
внешний SMTP-релей (напрямую с VPS нельзя — нет PTR/SPF/DKIM). Письма:
подтверждение заказа + уведомление админу (в `/api/orders`), приветствие при
регистрации (в `registerAction`). Антиспам (`src/lib/rateLimit.ts` +
`Honeypot`): honeypot-поле `website` на формах регистрации/входа/заказа и
rate-limit по IP. Для IP за nginx нужны заголовки `X-Forwarded-For`/`X-Real-IP`
(добавлены в конфиг market-store).

- `SITE_URL` (`src/lib/site.ts`) — единственный источник абсолютных URL:
  canonical, OG, JSON-LD, `sitemap.xml`, `robots.txt`. Без порта, без слэша.
- `ADMIN_PASSWORD` (`src/lib/adminAuth.ts`) — пароль входа в `/admin`. Дефолт
  `admin` только для локалки; на сервере ОБЯЗАТЕЛЬНО задать свой. В cookie
  кладётся SHA-256, а не сам пароль.
- Файл в `.gitignore`, через git не синхронизируется.

## 3. База данных и её персистентность

- Файл БД: `data/market.db` (+ `-wal`/`-shm`). Каталог `data/` в `.gitignore` —
  **при `git pull` в deploy.sh БД НЕ перезаписывается**, заказы и правки товаров
  сохраняются между деплоями. Не коммить `data/*.db`.
- Схема и автосид — в `src/lib/db.ts` (`getDb()`): при первом обращении, если
  товаров нет, БД засевается из `src/data/seed.json` (24 товара, 6 категорий из
  `demo-products.json`). Ручной пересев — `npm run seed`.
- Особенности API `node:sqlite` (важно при правках): нет `db.pragma()` →
  `db.exec("PRAGMA …")`; нет `db.transaction()` → ручные `BEGIN`/`COMMIT`/
  `ROLLBACK`; `.all()/.get()` возвращают null-prototype объекты — их нельзя
  отдавать в Client Components, поэтому строки маппятся в plain-объекты
  (`mapProduct`/`mapCategory` в `src/lib/catalog.ts`, `mapOrder` в
  `src/lib/orders.ts`). Касты через `as unknown as T`.

## 3b. Загрузка изображений товаров (админка)

Админка позволяет загружать картинку товара (`ProductForm` → `input[type=file]`,
серверный экшен → `saveUploadedImage` в `src/lib/adminData.ts`). Файлы кладутся в
`public/uploads/` (в `.gitignore`, переживают деплой как untracked). **Важно:**
`next start` НЕ раздаёт файлы, добавленные в `public/` после сборки (404),
поэтому отдаём их через рантайм-роут `src/app/uploads/[...path]/route.ts`
(читает с диска, отдаёт с Content-Type, есть защита от path traversal). Не
заменяй этот роут на «просто public» — сломается отдача загруженных файлов.

## 4. PM2 и nginx

- PM2-процесс называется **`market-store`**, Next.js слушает порт **3001**
  (порт 3000 занят site-001!). Порт задаётся при старте: `PORT=3001 pm2 start
  npm --name market-store -- start`, затем `pm2 save`. Не переименовывай процесс
  и не меняй порт без явной просьбы.
- nginx — reverse proxy на `localhost:3001` с обязательными заголовками
  `X-Forwarded-*` (конфиг `/etc/nginx/sites-available/market-store`). certbot на
  стандартном 443, http→https редирект. Конфиг site-001/beauty.an51.su —
  отдельный файл, market его не трогает.

## 5. Процесс деплоя

- На сервере: `/var/www/market-store/deploy.sh`
  (`git stash` → `git pull` → `git stash pop` → `npm install` → `npm run build`
  → `pm2 restart market-store`), защита от параллельного запуска через flock.
- Автопроверка новых коммитов — `auto-deploy-check.sh` по cron каждые 2 минуты.
- Скрипты лежат в корне репозитория; на сервере им нужен `chmod +x`.

## 6. Маршруты

- Публичные: `/` (главная), `/catalog`, `/catalog/[slug]` (категория),
  `/product/[slug]` (карточка, JSON-LD Product/Offer), `/cart`, `/checkout`,
  `/order/[number]` (подтверждение), `/account` (история заказов по email).
- API: `POST /api/orders` — создание заказа (серверная валидация цен/остатков,
  списание склада). Оплата ЮKassa — заглушка тестового режима, реальные
  транзакции не проводятся.
- Закрытые: `/admin` (товары CRUD), `/admin/orders` (статусы),
  `/admin/login`. Защита — cookie-сессия по `ADMIN_PASSWORD`.
- `robots.txt` закрывает `/admin`, `/account`, `/checkout`, `/api/`, `/order/`.

## 7. SEO

`generateMetadata()` на всех типах страниц (title/description/canonical/OG),
JSON-LD: Organization + WebSite (layout), BreadcrumbList (крошки), Product/Offer
(карточка), CollectionPage/ItemList (категория). `sitemap.xml` и `robots.txt` —
из `SITE_URL`, не хардкод. Alt-тексты у всех изображений.

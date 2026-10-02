# Продакшен-конфигурация проекта «Beauty» (market-001)

Интернет-магазин косметики на Next.js 16 + SQLite (`node:sqlite`), домен
**beauty.an51.su**. Работает на VDS **noemi** (IP 139.100.232.115, Ubuntu 24.04,
SSH-алиас `noemi`). Сервер общий: на нём же живут другие проекты (site-001,
finance-001, mv-004, andreev-realty и т.д.), их не трогай. При изменениях
сохраняй логику ниже — не хардкодь то, что должно браться из окружения.

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
SITE_URL=https://beauty.an51.su
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
  **при деплое (git fast-forward в `site-autodeploy.sh`) БД НЕ перезаписывается**, заказы и правки товаров
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
  (на этом сервере заняты также 3000 site-001, 3002 finance-001, 3003 mv-004,
  3012 andreev-realty). Порт задаётся при старте: `PORT=3001 pm2 start npm --name
  market-store -- start`, затем `pm2 save`. Не переименовывай процесс и не
  меняй порт без явной просьбы.
- nginx на noemi — reverse proxy beauty.an51.su на `localhost:3001` с
  обязательными заголовками `X-Forwarded-*`. certbot на стандартном 443,
  http→https редирект (301). Конфиги других сайтов на сервере отдельные,
  market-store их не трогает.

## 5. Процесс деплоя

- Деплой = пуш в ветку **master** (см. правила безопасности ниже: в master
  только с явного разрешения). Дальше всё делает сервер сам.
- Автодеплой: cron на noemi каждые 2 минуты запускает
  `/root/bin/site-autodeploy.sh /var/www/market-store master market-store 3001`,
  лог `/var/log/autodeploy-market-store.log`. Схема: `git fetch` → только
  fast-forward (локальные правки на сервере блокируют деплой) → `npm ci`, если
  изменился `package-lock.json` → `npm run build` (1 повтор) → `pm2 restart
  market-store --update-env` → проверка порта. Если сборка упала дважды, скрипт
  откатывает на прежний коммит и не пересобирает упавший, пока не появится новый.
- Старые `deploy.sh` и `auto-deploy-check.sh` в корне репозитория больше не
  используются cron'ом.
- **Кэш картинок next/image.** Скрипт деплоя не удаляет `.next`, поэтому
  `/var/www/market-store/.next/cache/images` переживает деплои (TTL Next 16: 4
  часа). Если заменяешь картинки с теми же именами (`public/images/design/*`,
  `public/images/products/*`), после деплоя очисти кэш вручную:
  `rm -rf /var/www/market-store/.next/cache/images`. Новые имена файлов
  чистки не требуют. При странном 500 после добавления роутов (stale client
  manifest) помогает `rm -rf .next` и пересборка.
- Любая работа на сервере по SSH (в том числе чистка кэша) только с явного
  подтверждения в чате.

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

## 8. Правила безопасности

Правила безопасности (действуют всегда, в любом режиме разрешений):
1. Работать только в отдельной ветке. Ветку master не трогать: не коммитить в неё, не мержить, не пушить.
2. На сервер по SSH не заходить и ничего на нём не менять без моего явного подтверждения в чате.
3. Ничего не удалять безвозвратно (файлы, ветки, базу данных) без моего подтверждения.
4. Если задача требует любого из этих действий, остановись и спроси меня.

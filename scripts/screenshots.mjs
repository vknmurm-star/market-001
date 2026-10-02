/**
 * Скриншоты страниц витрины (desktop 1440×900 и mobile 390×844) через
 * Playwright. Листает страницу до конца (чтобы подгрузились lazy-картинки),
 * ждёт шрифты, снимает fullPage.
 *
 * Запуск (сервер должен быть поднят):
 *   node scripts/screenshots.mjs --base http://localhost:3000 --out design/screenshots
 *
 * Опции:
 *   --pages   /,/catalog,/cart        список путей (по умолчанию — основные)
 *   --viewports desktop,mobile        (по умолчанию оба)
 *   --cookies                         НЕ принимать cookie-баннер (оставить на экране)
 *   --prefix home                     префикс имён файлов (иначе — из пути)
 *   --seed-cart                       перед съёмкой положить в корзину 2 реальных товара (для /cart, /checkout)
 *   --check-overflow                  печатать страницы с горизонтальной прокруткой
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const BASE = opt("base", "http://localhost:3000");
const OUT = opt("out", "design/screenshots");
const PAGES = opt("pages", "/,/catalog,/catalog/face-care,/cart").split(",");
const VIEWPORTS = opt("viewports", "desktop,mobile").split(",");
const KEEP_COOKIES = flag("cookies");
const CHECK_OVERFLOW = flag("check-overflow");
const SEED_CART = flag("seed-cart");

const SIZES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: SIZES[vp],
    deviceScaleFactor: 1,
    hasTouch: vp === "mobile",
    isMobile: vp === "mobile",
  });
  if (!KEEP_COOKIES) {
    await context.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent-v1", "accepted");
      } catch {}
    });
  }
  const page = await context.newPage();

  if (SEED_CART) {
    // Корзину наполняем через UI — данные берутся из реальной БД магазина.
    await page.goto(BASE + "/catalog", { waitUntil: "networkidle" });
    const hrefs = await page.$$eval('a[href^="/product/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))].slice(0, 2));
    for (const h of hrefs) {
      await page.goto(BASE + h, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /В корзину/ }).first().click();
      await page.waitForTimeout(300);
    }
  }

  for (const p of PAGES) {
    const url = BASE + p;
    const name =
      (opt("prefix", "") || (p === "/" ? "home" : p.replace(/^\//, "").replace(/[\/?=&]/g, "-"))) +
      `-${vp}.png`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      // html { scroll-behavior: smooth } ломает возврат наверх перед снимком
      await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        const step = Math.max(300, window.innerHeight * 0.8);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(250);
      if (vp === "mobile") {
        // fullPage сбрасывает эмуляцию касания (hover снова true и кнопка «В корзину»
        // прячется), поэтому растягиваем viewport до высоты страницы.
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width: SIZES.mobile.width, height: Math.min(h, 16000) });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(OUT, name) });
        await page.setViewportSize(SIZES.mobile);
      } else {
        await page.screenshot({ path: path.join(OUT, name), fullPage: true });
      }

      let note = "";
      if (CHECK_OVERFLOW) {
        const o = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
        }));
        if (o.sw > o.cw) note = `  ⚠ горизонтальная прокрутка: ${o.sw} > ${o.cw}`;
      }
      console.log(`✓ ${vp} ${p} → ${name}${note}`);
    } catch (e) {
      console.log(`✗ ${vp} ${p}: ${String(e.message).split("\n")[0]}`);
    }
  }
  await context.close();
}
await browser.close();

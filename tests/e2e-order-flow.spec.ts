import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Полный путь покупателя на живом проде beauty.an51.su, прогоняется дважды
 * (проекты desktop 1920×1080 и mobile 390×844, см. playwright.config.ts).
 *
 * Каждый шаг обёрнут в runStep() — падение одного шага не прерывает весь
 * прогон (чтобы отчёт показывал состояние ВСЕХ шагов, а не обрывался на
 * первой ошибке). Результаты и найденные ошибки консоли/сети пишутся в
 * test-results/*.json — итоговый test-results/report.md собирает
 * global-teardown.ts после того, как оба прогона (desktop + mobile) завершены.
 *
 * ВАЖНО: тест реально доводит заказ до конца — в БД прод-магазина появится
 * настоящая запись заказа (оплата — тестовая заглушка ЮKassa/СБП, деньги не
 * списываются). Имя/email покупателя намеренно узнаваемые (см. TEST_CUSTOMER),
 * чтобы такие заказы легко найти и удалить в /admin/orders.
 */

const SCREENSHOTS_DIR = path.join("test-results", "screenshots");
const STEPS_LOG_DIR = "test-results";

const DELIVERY_METHODS = ["cdek", "boxberry", "dpd", "fivepost", "russianpost"] as const;

const TEST_CUSTOMER = {
  name: "Тест Плейрайт",
  phone: "+7 900 000-00-00",
  address: "г. Москва, ул. Тестовая, д. 1, кв. 1",
  comment: "Автотест Playwright — тестовый заказ, можно удалить.",
};

type StepStatus = "OK" | "Ошибка" | "Пропущено";

interface StepResult {
  step: string;
  status: StepStatus;
  comment: string;
  screenshots: string[]; // относительные пути от test-results/
}

interface LogEntry {
  step: string;
  kind: "console" | "pageerror" | "network";
  detail: string;
}

function parsePrice(text: string): number {
  return Number(text.replace(/[^\d]/g, ""));
}

test.describe("Полный путь покупателя", () => {
  test("каталог → товар → корзина → чекаут → подтверждение", async (
    { page, context },
    testInfo,
  ) => {
    const project = testInfo.project.name; // "desktop" | "mobile"
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

    const steps: StepResult[] = [];
    const log: LogEntry[] = [];
    let currentStep = "инициализация";

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        log.push({ step: currentStep, kind: "console", detail: msg.text() });
      }
    });
    page.on("pageerror", (err) => {
      log.push({ step: currentStep, kind: "pageerror", detail: err.message });
    });
    page.on("response", (resp) => {
      const status = resp.status();
      if (status >= 400) {
        log.push({
          step: currentStep,
          kind: "network",
          detail: `${status} ${resp.request().method()} ${resp.url()}`,
        });
      }
    });

    async function shot(name: string): Promise<string> {
      const file = `${project}-${name}.png`;
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, file),
        fullPage: true,
      });
      return `screenshots/${file}`;
    }

    type StepReturn = string | { comment?: string; screenshots?: string[] } | void;

    async function runStep(
      name: string,
      screenshotName: string | null,
      fn: () => Promise<StepReturn>,
    ) {
      currentStep = name;
      const screenshots: string[] = [];
      try {
        const result = await fn();
        let comment = "—";
        if (typeof result === "string") {
          comment = result;
        } else if (result && typeof result === "object") {
          comment = result.comment ?? "—";
          if (result.screenshots) screenshots.push(...result.screenshots);
        }
        // Скриншот "после шага" — только если шаг сам не предоставил свой
        // (актуально для шагов, которые под конец уходят на другую страницу:
        // иначе автоскриншот перезаписал бы уже нерелевантным кадром).
        if (screenshotName && screenshots.length === 0) {
          screenshots.push(await shot(screenshotName));
        }
        steps.push({ step: name, status: "OK", comment, screenshots });
        console.log(`[${project}] ✓ ${name}`);
      } catch (err) {
        const message = err instanceof Error ? err.message.split("\n")[0] : String(err);
        if (screenshotName) {
          try {
            screenshots.push(await shot(`${screenshotName}-error`));
          } catch {
            /* если страница уже совсем не в порядке — без скриншота */
          }
        }
        steps.push({ step: name, status: "Ошибка", comment: message, screenshots });
        console.error(`[${project}] ✗ ${name}: ${message}`);
      }
    }

    function skip(name: string, comment: string) {
      steps.push({ step: name, status: "Пропущено", comment, screenshots: [] });
      console.log(`[${project}] ⊘ ${name}: ${comment}`);
    }

    // 1. Главная страница
    await runStep("Открыть главную страницу", "01-home", async () => {
      const resp = await page.goto("/");
      expect(resp?.status(), "HTTP-статус главной").toBeLessThan(400);
      await expect(page.locator("header")).toBeVisible();
    });

    // 2. Каталог загружается, товары отображаются
    let categoryHrefs: string[] = [];
    await runStep("Открыть каталог, проверить товары", "02-catalog", async () => {
      const resp = await page.goto("/catalog");
      expect(resp?.status()).toBeLessThan(400);
      const cards = page.locator('a[href^="/product/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });
      const count = await cards.count();
      if (count === 0) throw new Error("Ни одной карточки товара не найдено");

      categoryHrefs = await page
        .locator('nav[aria-label="Категории"] a')
        .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href") || ""))].filter(Boolean));
      if (categoryHrefs.length === 0) throw new Error("Не нашёл ни одной категории в шапке");

      return `Найдено ссылок на карточки товара: ${count}; категорий в меню: ${categoryHrefs.length}`;
    });

    // 3. Случайная категория
    let categoryHref = "";
    await runStep("Открыть случайную категорию", "03-category", async () => {
      if (categoryHrefs.length === 0) throw new Error("Список категорий пуст (см. шаг 2)");
      categoryHref = categoryHrefs[Math.floor(Math.random() * categoryHrefs.length)];
      const resp = await page.goto(categoryHref);
      expect(resp?.status()).toBeLessThan(400);
      const heading = await page.locator("h1").first().innerText();
      const countText = await page.getByText(/Найдено товаров:/).innerText();
      return `${categoryHref} — «${heading}», ${countText.trim()}`;
    });

    // 4. Фильтр по цене
    await runStep("Фильтр по цене в категории", "04-price-filter", async () => {
      const minInput = page.locator('input[name="min"]');
      const maxInput = page.locator('input[name="max"]');
      const maxPlaceholder = await maxInput.getAttribute("placeholder");
      const upperBound = Number(maxPlaceholder) || 5000;
      const lower = Math.floor(upperBound * 0.2);
      const upper = Math.floor(upperBound * 0.8);

      await minInput.fill(String(lower));
      await maxInput.fill(String(upper));
      await page.getByRole("button", { name: "ОК" }).click();
      await page.waitForURL(/min=/);

      const countText = await page.getByText(/Найдено товаров:/).innerText();
      return `Диапазон ${lower}–${upper} ₽ → ${countText.trim()}`;
    });

    // 5. Поиск (скрыт в шапке на мобильной версии — пропускаем там осознанно)
    if (project === "mobile") {
      skip("Поиск по каталогу", "Поле поиска скрыто в шапке на мобильной версии (Header.tsx: hidden md:flex)");
    } else {
      await runStep("Поиск по каталогу", "05-search", async () => {
        await page.goto("/catalog");
        const firstTitle = await page
          .locator('a[href^="/product/"] h3')
          .first()
          .innerText();
        const word = firstTitle
          .split(/\s+/)
          .map((w) => w.replace(/[^а-яА-ЯёЁa-zA-Z0-9]/g, ""))
          .filter((w) => w.length >= 4)[0];
        if (!word) throw new Error(`Не удалось выделить слово для поиска из «${firstTitle}»`);

        await page.getByPlaceholder("Поиск товаров…").fill(word);
        await page.getByRole("button", { name: "Найти" }).click();
        await page.waitForURL(/\/catalog\?q=/);

        const heading = await page.locator("h1").first().innerText();
        if (!heading.includes(word)) {
          throw new Error(`Заголовок результатов «${heading}» не содержит запрос «${word}»`);
        }
        const countText = await page.getByText(/Найдено товаров:/).innerText();
        const count = Number(countText.match(/\d+/)?.[0] ?? "0");
        if (count === 0) {
          throw new Error(`По запросу «${word}» (взят из названия реального товара) — 0 результатов`);
        }
        return `Запрос «${word}» → ${countText.trim()}`;
      });
    }

    // 6. Карточка товара
    let productName = "";
    let productPrice = 0;
    await runStep("Открыть карточку товара", "06-product", async () => {
      await page.goto("/catalog");
      const link = page.locator('a[href^="/product/"]').first();
      await link.click();
      await page.waitForURL(/\/product\//);

      await expect(page.locator("h1")).toBeVisible();
      productName = (await page.locator("h1").first().innerText()).trim();
      const priceText = await page
        .locator("span.text-2xl.font-bold, span.text-lg.font-semibold")
        .first()
        .innerText();
      productPrice = parsePrice(priceText);
      if (!productPrice) throw new Error(`Не удалось распознать цену из «${priceText}»`);

      return `«${productName}», цена ${productPrice} ₽`;
    });

    // 7. Галерея / лайтбокс
    await runStep("Галерея товара (лайтбокс)", "07-lightbox", async () => {
      const mainImageBtn = page.getByRole("button", { name: "Увеличить изображение" }).first();
      await mainImageBtn.click();
      const dialog = page.getByRole("dialog", { name: "Просмотр изображения" });
      await expect(dialog).toBeVisible();
      const shotPath = await shot("07-lightbox");
      await page.getByRole("button", { name: "Закрыть" }).click();
      await expect(dialog).toBeHidden();
      return { comment: "Лайтбокс открылся и закрылся штатно", screenshots: [shotPath] };
    });

    // 8. Добавить в корзину
    await runStep("Добавить товар в корзину", "08-added-to-cart", async () => {
      const addBtn = page.getByRole("button", { name: /В корзину|Добавлено/ }).first();
      await addBtn.click();
      await expect(addBtn).toHaveText("Добавлено ✓", { timeout: 3000 });
      const cartBadge = page.locator('a[href="/cart"] span').last();
      await expect(cartBadge).toHaveText("1");
      return "Кнопка переключилась в «Добавлено ✓», счётчик корзины в шапке = 1";
    });

    // 9. Корзина
    await runStep("Проверить корзину", "09-cart", async () => {
      await page.getByRole("link", { name: /^Корзина/ }).click();
      await page.waitForURL(/\/cart/);
      const itemName = await page.locator("li a.font-medium").first().innerText();
      if (productName && !itemName.includes(productName) && !productName.includes(itemName)) {
        throw new Error(`В корзине «${itemName}», ожидался товар «${productName}»`);
      }
      const totalText = await page
        .locator("aside")
        .getByText(/₽/)
        .last()
        .innerText();
      const total = parsePrice(totalText);
      if (productPrice && total !== productPrice) {
        throw new Error(`Сумма в корзине ${total} ₽ ≠ цене товара ${productPrice} ₽ (1 шт.)`);
      }
      return `Товар «${itemName}», итого ${total} ₽ — совпадает с ценой товара`;
    });

    // 10. Чекаут
    const testEmail = `playwright-test-${project}-${Date.now()}@example.com`;
    const chosenDelivery =
      DELIVERY_METHODS[Math.floor(Math.random() * DELIVERY_METHODS.length)];
    let checkoutTotal = 0;
    await runStep("Заполнить и отправить чекаут", "10-checkout-filled", async () => {
      await page.getByRole("link", { name: "Оформить заказ" }).click();
      await page.waitForURL(/\/checkout/);

      await page.locator('input[name="name"]').fill(TEST_CUSTOMER.name);
      await page.locator('input[name="phone"]').fill(TEST_CUSTOMER.phone);
      await page.locator('input[name="email"]').fill(testEmail);
      await page.locator('select[name="delivery"]').selectOption(chosenDelivery);
      await page.locator('input[name="address"]').fill(TEST_CUSTOMER.address);
      await page.locator('textarea[name="comment"]').fill(TEST_CUSTOMER.comment);
      // способ оплаты оставляем дефолтный — «При получении» (без интеграции с реальными платежами)

      const totalText = await page
        .locator("aside")
        .getByText(/₽/)
        .last()
        .innerText();
      checkoutTotal = parsePrice(totalText);

      // Скрин формы ДО сабмита — иначе после клика страница уже уйдёт на
      // /order/… и автоскриншот runStep показал бы не чекаут, а подтверждение.
      const filledFormShot = await shot("10-checkout-filled");
      await page.getByRole("button", { name: "Подтвердить заказ" }).click();
      try {
        await page.waitForURL(/\/order\//, { timeout: 20_000 });
      } catch (timeoutErr) {
        // Если редиректа не произошло — скорее всего форма показала ошибку
        // (например сработал rate-limit /api/orders, см. src/lib/rateLimit.ts:
        // 5 заказов/10 мин с одного IP — реальная защита от спама, а не баг;
        // легко словить именно при повторных прогонах этого теста подряд).
        const onPageError = await page
          .locator("aside p")
          .filter({ hasText: /./ })
          .last()
          .innerText()
          .catch(() => null);
        if (onPageError) {
          throw new Error(`Форма не отправилась — сообщение на странице: «${onPageError}»`);
        }
        throw timeoutErr;
      }

      return {
        comment: `Доставка: ${chosenDelivery}, email: ${testEmail}, итого на чекауте: ${checkoutTotal} ₽`,
        screenshots: [filledFormShot],
      };
    });

    // 11. Подтверждение заказа
    await runStep("Проверить страницу подтверждения заказа", "11-order-confirmation", async () => {
      await expect(page.getByText("Заказ оформлен!")).toBeVisible();
      const orderNumber = (
        await page.locator("div.text-2xl.font-bold.text-accent").innerText()
      ).trim();
      if (!orderNumber) throw new Error("Номер заказа не отображается");

      const totalText = await page
        .locator("div.mt-3.flex.justify-between")
        .getByText(/₽/)
        .innerText();
      const total = parsePrice(totalText);
      if (checkoutTotal && total !== checkoutTotal) {
        throw new Error(
          `Итог на странице подтверждения ${total} ₽ ≠ итогу на чекауте ${checkoutTotal} ₽`,
        );
      }
      return `Заказ №${orderNumber}, итого ${total} ₽ — совпадает с чекаутом`;
    });

    // 12. Проверка внутренних ссылок в шапке/подвале на битые ссылки (проактивно, помимо пассивного сбора 404 выше)
    await runStep("Проверить внутренние ссылки шапки/подвала на 404", null, async () => {
      await page.goto("/");
      const hrefs = await page
        .locator("header a[href], footer a[href]")
        .evaluateAll((els) =>
          els
            .map((e) => e.getAttribute("href") || "")
            .filter((h) => h && !h.startsWith("mailto:") && !h.startsWith("tel:") && !h.startsWith("#")),
        );
      const unique = [...new Set(hrefs)];
      const broken: string[] = [];
      for (const href of unique) {
        try {
          const resp = await page.request.get(new URL(href, page.url()).toString());
          if (!resp.ok()) broken.push(`${href} → ${resp.status()}`);
        } catch (e) {
          broken.push(`${href} → ошибка запроса (${(e as Error).message.split("\n")[0]})`);
        }
      }
      if (broken.length > 0) {
        throw new Error(`Битые ссылки (${broken.length} из ${unique.length}): ${broken.join("; ")}`);
      }
      return `Проверено ${unique.length} уникальных внутренних ссылок — все отвечают 2xx/3xx`;
    });

    // Сохраняем сырые результаты для global-teardown (который соберёт report.md
    // после того, как ОБА прогона — desktop и mobile — завершатся).
    fs.writeFileSync(
      path.join(STEPS_LOG_DIR, `steps-${project}.json`),
      JSON.stringify(steps, null, 2),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(STEPS_LOG_DIR, `errors-${project}.json`),
      JSON.stringify(log, null, 2),
      "utf-8",
    );

    await context.close().catch(() => {});
  });
});

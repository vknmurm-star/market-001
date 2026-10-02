import fs from "node:fs";
import path from "node:path";

const RESULTS_DIR = "test-results";
const PROJECTS = ["desktop", "mobile"] as const;

type StepStatus = "OK" | "Ошибка" | "Пропущено";

interface StepResult {
  step: string;
  status: StepStatus;
  comment: string;
  screenshots: string[];
}

interface LogEntry {
  step: string;
  kind: "console" | "pageerror" | "network";
  detail: string;
}

function readJson<T>(file: string): T | null {
  const full = path.join(RESULTS_DIR, file);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
  } catch {
    return null;
  }
}

function statusIcon(status: StepStatus): string {
  if (status === "OK") return "✅ OK";
  if (status === "Ошибка") return "❌ Ошибка";
  return "⊘ Пропущено";
}

function stepsTable(steps: StepResult[]): string {
  const rows = steps.map((s) => {
    const screenshots = s.screenshots.length
      ? s.screenshots.map((p, i) => `[скрин ${i + 1}](${p})`).join(", ")
      : "—";
    const comment = s.comment.replace(/\|/g, "\\|").replace(/\n/g, " ");
    return `| ${s.step} | ${statusIcon(s.status)} | ${comment} | ${screenshots} |`;
  });
  return [
    "| Шаг | Статус | Комментарий | Скриншоты |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function summary(steps: StepResult[]): string {
  const ok = steps.filter((s) => s.status === "OK").length;
  const err = steps.filter((s) => s.status === "Ошибка").length;
  const skipped = steps.filter((s) => s.status === "Пропущено").length;
  return `**Итого:** ${ok} OK, ${err} ошибок, ${skipped} пропущено (из ${steps.length} шагов).`;
}

function errorsSection(log: LogEntry[] | null): string {
  if (!log || log.length === 0) return "Ошибок консоли/сети не обнаружено.";
  const byKindLabel: Record<LogEntry["kind"], string> = {
    console: "JS-ошибка в консоли",
    pageerror: "Необработанное исключение на странице",
    network: "Сетевая ошибка (4xx/5xx)",
  };
  const rows = log.map(
    (e) => `| ${e.step} | ${byKindLabel[e.kind]} | ${e.detail.replace(/\|/g, "\\|").slice(0, 300)} |`,
  );
  return [
    "| Шаг, во время которого произошло | Тип | Детали |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

export default async function globalTeardown() {
  const now = new Date().toISOString();
  const parts: string[] = [
    "# Отчёт e2e-тестирования пути покупателя — beauty.an51.su",
    "",
    `Дата прогона: ${now}`,
    "",
    "Полный путь: главная → каталог → случайная категория → фильтр по цене → " +
      "поиск (desktop) → карточка товара → галерея/лайтбокс → добавление в " +
      "корзину → корзина → чекаут → подтверждение заказа → проверка внутренних " +
      "ссылок на 404. Прогон выполнен дважды: десктоп (1920×1080) и мобильный " +
      "(390×844) вьюпорт.",
    "",
  ];

  for (const project of PROJECTS) {
    const steps = readJson<StepResult[]>(`steps-${project}.json`);
    const log = readJson<LogEntry[]>(`errors-${project}.json`);

    parts.push(`## ${project === "desktop" ? "Desktop (1920×1080)" : "Mobile (390×844)"}`);
    parts.push("");

    if (!steps) {
      parts.push(
        `⚠️ Файл \`steps-${project}.json\` не найден — прогон для этого вьюпорта, ` +
          "похоже, не завершился (упал раньше, чем успел записать результаты).",
      );
      parts.push("");
      continue;
    }

    parts.push(summary(steps));
    parts.push("");
    parts.push(stepsTable(steps));
    parts.push("");
    parts.push("### Ошибки консоли/сети во время прогона");
    parts.push("");
    parts.push(errorsSection(log));
    parts.push("");
  }

  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, "report.md"), parts.join("\n"), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`\nОтчёт сохранён: ${path.join(RESULTS_DIR, "report.md")}`);
}

import localFont from "next/font/local";

/**
 * Самохостинг шрифтов через next/font/local: файлы лежат в src/fonts, сборка
 * не обращается к Google Fonts. У каждого семейства два файла (latin и
 * cyrillic) с собственным unicode-range — браузер скачивает только тот,
 * чьи символы реально есть на странице. display: swap — текст виден сразу.
 *
 * Все значения записаны литералами: загрузчик next/font не принимает
 * константы и spread. adjustFontFallback выключен намеренно: при двух
 * @font-face одного семейства автоматический «подогнанный» fallback
 * перекрывал бы соседнее подмножество (латиница шла бы Times New Roman).
 *
 * Подмножества (Google Fonts):
 *  latin    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
 *           U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
 *           U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
 *  cyrillic U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116
 */

// Заголовочный: Cormorant Garamond 300–600 (вариативный файл)
export const cormorantCyrillic = localFont({
  src: "../fonts/cormorant-garamond-cyrillic.woff2",
  weight: "300 600",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-cormorant-cyr",
  declarations: [
    { prop: "unicode-range", value: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116" },
  ],
  preload: true,
});

export const cormorantLatin = localFont({
  src: "../fonts/cormorant-garamond-latin.woff2",
  weight: "300 600",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-cormorant-lat",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  preload: false,
});

// Основной: Manrope 400–700 (вариативный файл)
export const manropeCyrillic = localFont({
  src: "../fonts/manrope-cyrillic.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-manrope-cyr",
  declarations: [
    { prop: "unicode-range", value: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116" },
  ],
  preload: true,
});

export const manropeLatin = localFont({
  src: "../fonts/manrope-latin.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-manrope-lat",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  preload: false,
});

/** Классы с CSS-переменными шрифтов — вешаются на <html>. */
export const fontVariables = [
  cormorantCyrillic.variable,
  cormorantLatin.variable,
  manropeCyrillic.variable,
  manropeLatin.variable,
].join(" ");

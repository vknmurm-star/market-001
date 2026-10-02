# Design System — Beauty (Premium Editorial Beauty Store)

## Общая концепция

Стиль: Quiet Luxury / Editorial Beauty

Референсы:
- Aesop
- Byredo
- Diptyque
- Augustinus Bader

Основные принципы:
- много воздуха
- крупная типографика
- спокойная палитра
- акцент на фотографии
- минимум декоративных элементов
- отсутствие визуального шума
- акцентный цвет используется редко

---

# 1. Цветовая система

## Основной фон

```css
--background: #F7F3EE;
```

Использование:
- фон страницы
- большие секции

---

## Поверхности

```css
--surface: #FCFAF7;
```

Использование:
- карточки
- формы
- отзывы
- блоки преимуществ

---

## Альтернативная поверхность

```css
--surface-alt: #F1EBE3;
```

Использование:
- подписка
- акцентные фоновые секции

---

## Основной текст

```css
--text-primary: #2F2A26;
```

Использование:
- заголовки
- меню
- цены

---

## Вторичный текст

```css
--text-secondary: #6F665F;
```

Использование:
- описания
- подписи
- метаинформация

---

## Третичный текст

```css
--text-muted: #9A9188;
```

Использование:
- подсказки
- второстепенные подписи

---

## Акцентный цвет бренда

```css
--accent: #A8552E;
```

Использование:
- кнопки
- активные ссылки
- бейджи
- счётчик корзины

---

## Hover акцента

```css
--accent-hover: #8F4725;
```

---

## Светлый акцент

```css
--accent-light: #D9B29B;
```

Использование:
- номера шагов
- декоративные элементы

---

## Разделители

```css
--border: #E6DED4;
```

---

## Тонкие линии

```css
--border-soft: #EFE8E0;
```

---

# 2. Типографика

## Заголовочный шрифт

Google Fonts:

```html
Cormorant Garamond
```

Вес:

```css
300
400
500
600
```

---

## Основной текст

Google Fonts:

```html
Manrope
```

Вес:

```css
400
500
600
700
```

---

# Desktop Typography

## H1

Используется:
- Hero
- крупные editorial-блоки

```css
font-family: Cormorant Garamond;
font-size: 88px;
font-weight: 400;
line-height: 0.95;
letter-spacing: -0.03em;
```

---

## H2

```css
font-family: Cormorant Garamond;
font-size: 64px;
font-weight: 400;
line-height: 1;
letter-spacing: -0.02em;
```

---

## H3

```css
font-family: Cormorant Garamond;
font-size: 42px;
font-weight: 400;
line-height: 1.1;
```

---

## H4

```css
font-family: Cormorant Garamond;
font-size: 30px;
font-weight: 400;
line-height: 1.15;
```

---

## Body Large

```css
font-family: Manrope;
font-size: 20px;
font-weight: 400;
line-height: 1.7;
```

---

## Body

```css
font-family: Manrope;
font-size: 16px;
font-weight: 400;
line-height: 1.7;
```

---

## Small

```css
font-family: Manrope;
font-size: 14px;
font-weight: 400;
line-height: 1.6;
```

---

## Caption

```css
font-family: Manrope;
font-size: 12px;
font-weight: 500;
line-height: 1.5;
letter-spacing: 0.15em;
text-transform: uppercase;
```

---

## Button

```css
font-family: Manrope;
font-size: 15px;
font-weight: 600;
line-height: 1;
letter-spacing: 0.02em;
```

---

# Mobile Typography

## H1

```css
font-size: 52px;
line-height: 0.95;
```

---

## H2

```css
font-size: 40px;
line-height: 1;
```

---

## H3

```css
font-size: 30px;
line-height: 1.1;
```

---

## Body Large

```css
font-size: 18px;
line-height: 1.6;
```

---

## Body

```css
font-size: 15px;
line-height: 1.7;
```

---

## Small

```css
font-size: 13px;
```

---

# 3. Сетка

## Desktop

Максимальная ширина:

```css
1440px
```

Контейнер:

```css
1320px
```

Отступы контейнера:

```css
60px
```

---

Колонки:

```css
12 columns
```

Gap:

```css
24px
```

---

## Mobile

Контейнер:

```css
100%
```

Поля:

```css
20px
```

---

# Вертикальные отступы секций

## Desktop

Hero → следующая секция

```css
120px
```

Обычные секции

```css
96px
```

Малые секции

```css
72px
```

---

## Mobile

```css
64px
48px
```

---

# 4. Компоненты

# Primary Button

Размер:

```css
height: 56px;
padding-inline: 32px;
border-radius: 6px;
```

Фон:

```css
#A8552E
```

Текст:

```css
#FFFFFF
```

Hover:

```css
background: #8F4725;
transform: translateY(-1px);
```

---

# Secondary Button

```css
background: transparent;
border: 1px solid #D8CFC5;
```

Hover:

```css
background: #F1EBE3;
```

---

# Text Button

```css
display: inline-flex;
gap: 8px;
```

Hover:

```css
gap: 12px;
```

---

# Карточка товара

Размер:

```css
width: 100%;
```

Фон:

```css
#FCFAF7
```

Скругление:

```css
8px
```

Фото:

```css
aspect-ratio: 4/5;
```

Внутренний отступ:

```css
20px
```

---

Hover

```css
translateY(-4px);
```

Тень:

```css
0 12px 30px rgba(0,0,0,.06)
```

---

Кнопка "В корзину"

По умолчанию:

```css
opacity: 0;
transform: translateY(10px);
```

Hover карточки:

```css
opacity: 1;
transform: translateY(0);
```

---

# Карточка категории

Скругление:

```css
8px
```

Фото:

```css
cover
```

Затемнение:

```css
linear-gradient(
transparent,
rgba(0,0,0,.25)
)
```

Hover:

```css
scale(1.02)
```

---

# Input

Высота:

```css
56px
```

Скругление:

```css
6px
```

Фон:

```css
#FFFFFF
```

Граница:

```css
1px solid #E6DED4
```

Focus:

```css
border-color: #A8552E
```

---

# Header

Высота:

```css
88px
```

Тонкая верхняя полоса:

```css
40px
```

Фон:

```css
#A8552E
```

---

Логотип

```css
48px
```

---

Меню

```css
16px
```

Gap:

```css
40px
```

---

# Footer

Фон:

```css
#FCFAF7
```

Верхний отступ:

```css
96px
```

Колонки:

```css
5
```

Разделитель сверху:

```css
1px solid #E6DED4
```

---

# 5. Анимации

Принцип:

Очень спокойные и почти незаметные.

---

## Общая длительность

```css
300ms
```

Easing

```css
cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Hover карточек

```css
transform
opacity
box-shadow
```

---

## Кнопки

```css
background-color
transform
```

---

## Фото категорий

```css
scale(1 → 1.02)
```

---

## Ссылки

Подчёркивание появляется через:

```css
width transition
```

---

# 6. Фотографии

## Общий стиль

Quiet Luxury Beauty Editorial

---

## Освещение

```text
мягкий дневной свет
утреннее солнце через окно
естественные тени
без студийных бликов
```

---

## Цветовая температура

```text
тёплая нейтральная
4500–5200K
```

---

## Фоны

```text
травертин
светлый известняк
лён
натуральное дерево
матовая штукатурка
светлая керамика
```

---

## Цвета реквизита

```text
ivory
beige
sand
cream
warm stone
olive green
```

---

## Товары

```text
матовые баночки
янтарные стеклянные флаконы
молочное стекло
белая керамика
```

---

## Запрещено

```text
неон
кислотные цвета
глянец
яркие градиенты
стоковые фото
сильная ретушь кожи
синий холодный свет
3D-рендеры
```

---

# Tailwind базовые значения

```js
borderRadius: {
  sm: '6px',
  md: '8px'
}

maxWidth: {
  container: '1320px'
}

colors: {
  background: '#F7F3EE',
  surface: '#FCFAF7',
  accent: '#A8552E',
  accentHover: '#8F4725',
  text: '#2F2A26',
  secondary: '#6F665F',
  border: '#E6DED4'
}
```

Цель визуала: ощущение дорогого косметического бутика и редакционной съёмки журнала Vogue Living, реализованное исключительно средствами HTML, Tailwind CSS и качественной фотографии.
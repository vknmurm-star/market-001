import type { SVGProps } from "react";

/**
 * Тонкие линейные иконки (stroke 1.25–1.5, без заливки) в стиле макета.
 * Все наследуют цвет через currentColor и скрыты от скринридеров —
 * смысл всегда дублируется текстом рядом или aria-label на кнопке.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Svg size={16} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
);
export const ChevronDown = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
);
export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.5 20c.6-3.7 3.7-5.8 7.5-5.8s6.9 2.1 7.5 5.8" />
  </Svg>
);
export const BagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 8h13l-1 12h-11z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Svg>
);
export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const TruckIcon = (p: IconProps) => (
  <Svg size={32} strokeWidth={1.1} {...p}>
    <path d="M2.5 6.5h11v10h-11z" />
    <path d="M13.5 10h4l3 3v3.5h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Svg>
);
export const CardIcon = (p: IconProps) => (
  <Svg size={32} strokeWidth={1.1} {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
    <path d="M2.5 10h19M6 15h4" />
  </Svg>
);
export const LayersIcon = (p: IconProps) => (
  <Svg size={32} strokeWidth={1.1} {...p}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5z" />
    <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
  </Svg>
);
export const ReturnIcon = (p: IconProps) => (
  <Svg size={32} strokeWidth={1.1} {...p}>
    <path d="M4 12a8 8 0 1 0 2.6-5.9" />
    <path d="M4 4v4.5h4.5" />
  </Svg>
);
export const StarIcon = (p: IconProps) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...p}
  >
    <path d="m12 2.8 2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17.3 6.2 20.6l1.3-6.5L2.7 9.6l6.5-.8z" />
  </svg>
);

/* ------------------------- значки способов оплаты (упрощённые) ------------ */
export function MirMark() {
  return (
    <svg width="46" height="16" viewBox="0 0 46 16" role="img" aria-label="МИР">
      <text
        x="0"
        y="13"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="-0.4"
        fill="#1d9d57"
      >
        МИР
      </text>
    </svg>
  );
}
export function VisaMark() {
  return (
    <svg width="46" height="16" viewBox="0 0 46 16" role="img" aria-label="Visa">
      <text
        x="0"
        y="13"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="16"
        letterSpacing="-0.5"
        fill="#1a3a8f"
      >
        VISA
      </text>
    </svg>
  );
}
export function MastercardMark() {
  return (
    <svg width="30" height="20" viewBox="0 0 30 20" role="img" aria-label="Mastercard">
      <circle cx="11" cy="10" r="8" fill="#e63b2e" />
      <circle cx="19" cy="10" r="8" fill="#f5a623" fillOpacity="0.92" />
    </svg>
  );
}
export function SbpMark() {
  return (
    <svg width="46" height="20" viewBox="0 0 46 20" role="img" aria-label="СБП">
      <path d="M2 3.5 8 7v6l-6 3.5z" fill="#5b57a8" />
      <path d="m8 7 6-3.5v6L8 13z" fill="#2fa3dc" />
      <path d="m8 13 6-3.5V16L8 19.5z" fill="#2db27a" />
      <text
        x="19"
        y="14.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        fill="#3a3a52"
      >
        сбп
      </text>
    </svg>
  );
}

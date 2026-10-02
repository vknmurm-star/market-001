import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "md" | "sm";

const base =
  "type-button inline-flex items-center justify-center whitespace-nowrap select-none transition ease-brand disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, Record<ButtonSize, string>> = {
  // 56px, радиус 6, hover: темнее фон и подъём на 1px
  primary: {
    md: "h-14 gap-2 rounded-sm bg-accent px-8 text-white hover:-translate-y-px hover:bg-accent-hover active:translate-y-0",
    sm: "h-11 gap-2 rounded-sm bg-accent px-5 text-white hover:-translate-y-px hover:bg-accent-hover active:translate-y-0",
  },
  secondary: {
    md: "h-14 gap-2 rounded-sm border border-[#d8cfc5] bg-transparent px-8 text-foreground hover:bg-surface-alt",
    sm: "h-11 gap-2 rounded-sm border border-[#d8cfc5] bg-transparent px-5 text-foreground hover:bg-surface-alt",
  },
  // гэп между текстом и стрелкой растёт 8 → 12px
  text: {
    md: "gap-2 text-accent hover:gap-3 hover:text-accent-hover",
    sm: "gap-2 text-accent hover:gap-3 hover:text-accent-hover",
  },
};

/** Строка классов кнопки — для нестандартных элементов (submit в формах и т.п.). */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${base} ${variants[variant][size]} ${extra}`.trim();
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** стрелка → справа от подписи (по умолчанию у text-кнопки) */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };
type NativeProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

export default function Button(props: LinkProps | NativeProps) {
  const {
    variant = "primary",
    size = "md",
    arrow = variant === "text",
    className = "",
    children,
    ...rest
  } = props;
  const cls = buttonClass(variant, size, className);
  const content = (
    <>
      {children}
      {arrow && <ArrowRight />}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as Omit<LinkProps, keyof CommonProps>;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {content}
      </Link>
    );
  }
  const { type = "button", ...btnRest } = rest as Omit<NativeProps, keyof CommonProps>;
  return (
    <button type={type} className={cls} {...btnRest}>
      {content}
    </button>
  );
}

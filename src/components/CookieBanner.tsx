"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "cookie-consent-v1";

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Проверяем флаг только на клиенте — чтобы не было рассинхрона гидратации и
  // чтобы баннер не мелькал у тех, кто уже согласился.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "accepted") setVisible(true);
    } catch {
      // localStorage недоступен (приватный режим) — покажем баннер как обычно.
      setVisible(true);
    }
  }, []);

  // Пока баннер виден, резервируем под него место внизу страницы: без этого
  // fixed-баннер может намертво перекрыть последний блок контента на короткой
  // странице (например, детали заказа на /order/[number]), если высоты
  // страницы не хватает, чтобы прокрутить дальше него.
  useEffect(() => {
    const el = bannerRef.current;
    if (!visible || !el) {
      document.body.style.paddingBottom = "";
      return;
    }
    const applyPadding = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    };
    applyPadding();
    const ro = new ResizeObserver(applyPadding);
    ro.observe(el);
    window.addEventListener("resize", applyPadding);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyPadding);
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // игнорируем — баннер всё равно скроем на эту сессию
    }
    setVisible(false);
  };

  // Не мешаем оформлению заказа: на странице checkout баннер не показываем.
  if (!visible || pathname?.startsWith("/checkout")) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Уведомление об использовании cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4"
    >
      {/* На мобильных — тонкая однострочная полоса (не блок на треть экрана,
          который на коротких страницах закрывает цену/кнопку «В корзину»
          первого ряда товаров); от sm: — просторная плашка. */}
      <div className="mx-auto flex max-w-container items-center gap-3 rounded-md border border-border bg-surface px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)] sm:gap-6 sm:px-6 sm:py-4">
        <p className="min-w-0 flex-1 text-xs leading-snug text-secondary sm:text-sm">
          <span className="sm:hidden">Мы используем cookies для корзины и входа.</span>
          <span className="hidden sm:inline">
            Мы используем cookies, чтобы работали корзина и вход в аккаунт.
            Продолжая пользоваться сайтом, вы соглашаетесь с этим.
          </span>
        </p>
        <button
          type="button"
          onClick={accept}
          className="type-button h-9 shrink-0 rounded-sm bg-accent px-4 text-[13px] text-white transition ease-brand hover:bg-accent-hover sm:h-11 sm:px-6 sm:text-[15px]"
        >
          Принять
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "cookie-consent-v1";

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

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
      role="region"
      aria-label="Уведомление об использовании cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="container-page flex flex-col items-center gap-3 rounded-2xl border border-accent-soft bg-card p-4 shadow-lg sm:flex-row sm:gap-4">
        <p className="text-sm leading-snug text-muted">
          Мы используем cookies, чтобы работали корзина и вход в аккаунт.
          Продолжая пользоваться сайтом, вы соглашаетесь с этим.
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 sm:ml-auto"
        >
          Принять
        </button>
      </div>
    </div>
  );
}

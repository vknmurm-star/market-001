import { requireAdmin } from "@/lib/adminAuth";
import { getSetting } from "@/lib/settings";
import { uploadLogoAction, removeLogoAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const OK: Record<string, string> = {
  logo: "Логотип обновлён.",
  removed: "Логотип удалён — в шапке снова текст «Beauty».",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const logo = getSetting("site_logo");
  const ok = typeof sp.ok === "string" ? OK[sp.ok] : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Настройки сайта</h1>

      {ok && (
        <p className="mb-6 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {ok}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Логотип в шапке</h2>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border bg-background">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt="Текущий логотип"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-accent">Beauty</span>
            )}
          </div>
          <span className="text-sm text-muted">
            {logo
              ? "Сейчас в шапке показывается загруженный логотип."
              : "Логотип не задан — в шапке текст «Beauty»."}
          </span>
        </div>

        <form
          action={uploadLogoAction}
          encType="multipart/form-data"
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Загрузить логотип
            </span>
            <input
              type="file"
              name="logoFile"
              required
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-dark"
            />
            <span className="mt-1 block text-xs text-muted">
              PNG, JPG, WEBP или SVG, до 2 МБ. Лучше — горизонтальный, на
              прозрачном фоне. Заменит текстовую надпись «Beauty» в шапке.
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark"
            >
              Сохранить логотип
            </button>
          </div>
        </form>

        {logo && (
          <form action={removeLogoAction} className="border-t pt-4">
            <button className="text-sm text-muted underline hover:text-accent">
              Удалить логотип (вернуть текст)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

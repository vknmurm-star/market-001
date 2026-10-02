import Image from "next/image";
import Button from "@/components/ui/Button";

export interface ValueTile {
  title: string;
  image: string | null;
}

/**
 * «Больше, чем косметика»: слева текст и кнопка, справа асимметричная
 * фотосетка — одна высокая плитка и две пониже.
 */
export default function Values({
  tiles,
}: {
  tiles: [ValueTile, ValueTile, ValueTile];
}) {
  const [big, a, b] = tiles;
  const tile = (t: ValueTile, sizes: string, cls: string, titleCls: string) => (
    <div className={`relative isolate overflow-hidden rounded-md bg-surface-alt ${cls}`}>
      {t.image ? (
        <Image
          src={t.image}
          alt=""
          fill
          sizes={sizes}
          className="-z-10 object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-surface-alt to-accent-light/50"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,.4) 0%, rgba(0,0,0,.12) 50%, rgba(0,0,0,0) 80%)",
        }}
      />
      <p className={`absolute inset-x-0 bottom-0 p-5 font-display text-white md:p-7 ${titleCls}`}>
        {t.title}
      </p>
    </div>
  );

  return (
    <section aria-labelledby="values-title" className="section-y">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <p className="type-caption mb-4 text-secondary">Наши ценности</p>
          <h2 id="values-title" className="type-h2">
            Больше, чем косметика
          </h2>
          <p className="type-body mt-6 max-w-md text-secondary">
            Мы собрали в одном месте уход за лицом и телом, средства для волос,
            макияж, парфюмерию и аксессуары — чтобы забота о себе стала простой
            и приятной ежедневной привычкой.
          </p>
          <div className="mt-8">
            <Button href="/about" arrow>
              Подробнее о нас
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {tile(
            big,
            "(max-width: 1024px) 50vw, 30vw",
            "col-span-2 aspect-[4/3] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:min-h-[420px]",
            "text-[28px] leading-[1.05] md:text-[34px]",
          )}
          {tile(
            a,
            "(max-width: 1024px) 50vw, 24vw",
            "aspect-[4/3]",
            "text-[22px] leading-[1.1] md:text-[26px]",
          )}
          {tile(
            b,
            "(max-width: 1024px) 50vw, 24vw",
            "aspect-[4/3]",
            "text-[22px] leading-[1.1] md:text-[26px]",
          )}
        </div>
      </div>
    </section>
  );
}

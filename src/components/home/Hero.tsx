import Image from "next/image";
import Button from "@/components/ui/Button";

/**
 * Hero: крупное фото на всю ширину, слева — заголовок и кнопка.
 * Слайдера нет (один слайд) — без точек пагинации.
 *
 * Если нового фото public/images/design/hero.* ещё нет, показываем прежний
 * портрет модели справа с мягким переходом в фон — страница не ломается.
 */
export default function Hero({ image }: { image: string | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-surface-alt">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="-z-20 object-cover object-[72%_center] md:object-center"
        />
      ) : (
        <div
          className="absolute inset-y-0 right-0 -z-20 w-full md:w-[58%] md:[mask-image:linear-gradient(to_right,transparent,#000_28%)]"
        >
          <Image
            src="/images/hero/model-hero.png"
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover object-[50%_18%]"
          />
        </div>
      )}

      {/* вуаль в цвет фона: читаемость заголовка на любом фото */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/0 via-background/50 to-background/95 md:bg-gradient-to-r md:from-background/70 md:via-background/25 md:to-transparent"
      />

      <div className="container-page flex min-h-[700px] items-end pb-12 pt-16 md:min-h-[640px] md:items-center md:py-16 lg:min-h-[700px]">
        <div className="max-w-[640px]">
          <p className="type-caption text-secondary">Интернет-магазин косметики</p>
          <h1 className="type-h1 mt-6">
            Красота
            <br />в гармонии
            <br />с собой
          </h1>
          <p className="type-body-lg mt-6 max-w-md text-secondary">
            Уход за лицом и телом, волосы, макияж, парфюмерия и аксессуары:
            всё для вашего ежедневного ритуала красоты.
          </p>
          <div className="mt-9">
            <Button href="/catalog" arrow>
              Перейти в каталог
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

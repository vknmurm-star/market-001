import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <div className="text-6xl font-bold text-accent">404</div>
      <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 text-muted">
        Возможно, товар снят с продажи или ссылка устарела.
      </p>
      <Link
        href="/catalog"
        className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
      >
        В каталог
      </Link>
    </div>
  );
}

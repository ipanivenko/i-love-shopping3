import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCartRecommendations, getGuestCartRecommendations } from '../../api/cart/getRecommendations';

type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  brand: string;
  category: string;
  gender: string | null;
  thumbnailUrl: string | null;
};

export default function CartRecommendations() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRecommendations() {
    if (isAuthLoading) return;

    try {
      setLoading(true);

      const data = isAuthenticated
        ? await getCartRecommendations()
        : await getGuestCartRecommendations();

      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecommendations();

    function handleUpdate() {
      loadRecommendations();
    }

    window.addEventListener('cart-updated', handleUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleUpdate);
    };
  }, [isAuthenticated, isAuthLoading]);

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 shadow-inner">
          <span className="text-2xl">✨</span>
        </div>

        <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950">
          You may like
        </h2>

        <p className="mt-2 text-sm font-medium text-zinc-500">
          Related products based on your cart
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl transition duration-300 group-hover:scale-125" />

            <div className="relative">
              <div className="flex h-52 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-inner">
                <img
                  src={product.thumbnailUrl ?? ""}
                  alt={product.name}
                  className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {product.brand}
                </p>

                <h3 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-zinc-950">
                  {product.name}
                </h3>

                <p className="mt-2 text-sm font-medium text-zinc-500">
                  {product.category}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xl font-black tracking-tight text-zinc-950">
                    {(product.priceCents / 100).toFixed(2)}{" "}
                    {product.currency}
                  </p>

                  <div className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-zinc-900/20 transition group-hover:bg-emerald-700">
                    View
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
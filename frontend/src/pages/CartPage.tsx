import { useEffect, useState } from 'react'
import { previewCart } from '../api/cart/guestCartVerify'
import {
    getGuestCart,
    updateGuestCartQuantity,
    removeFromGuestCart,
    recalculateGuestCart,
    removeItemFromCartState
} from '../components/cart/cartStorage'
import type { CartPreviewResponse } from '@app/shared/cart'
import { Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router';
import { useClearCart } from '../components/cart/useClearCart';
import { useAuth } from '../context/AuthContext';
import { getUserCart } from '../api/cart/getUserCart';
import { removeFromUserCart } from '../api/cart/removeItem';
import CartRecommendations from '../components/cart/cartRecommendations';
import { updateUserCartQuantity } from '../api/cart/userQuantityChange';
import { ResumePaymentBanner } from '../components/payment/UnfinishedPayment';
import { usePendingPayment } from '../components/payment/useUnfinishedPayment'
import Container from '../components/ui/Container';

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartPreviewResponse | null>(null)
    const clearCart = useClearCart(setCart);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { isAuthenticated } = useAuth();
    const { pendingPayment, remainingTime } = usePendingPayment()

    async function loadCart() {
        try {
            setLoading(true)
            setError("")

            if (isAuthenticated) {
                const userCart = await getUserCart()

                setCart(userCart)
                return
            }

            const localItems = getGuestCart()

            if (localItems.length === 0) {
                setCart({
                    items: [],
                    subtotalCents: 0,
                    warnings: [],
                })
                return
            }

            const preview = await previewCart(localItems)
            setCart(preview)
        } catch {
            setError("Could not load cart.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCart()
    }, [isAuthenticated])

    async function handleQuantityChange(skuId: string, quantity: number) {
        if (quantity < 1) return

        if (isAuthenticated) {
            try {
                const updatedCart = await updateUserCartQuantity(skuId, quantity)
                setCart(updatedCart)
                window.dispatchEvent(new Event('cart-updated'))
            } catch {
                setError('Could not update quantity.')
            }

            return
        }

        updateGuestCartQuantity(skuId, quantity)

        setCart((currentCart) => {
            if (!currentCart) return currentCart
            return recalculateGuestCart(currentCart, skuId, quantity)
        })

        window.dispatchEvent(new Event('cart-updated'))
    }


    async function handleRemove(skuId: string) {
        if (isAuthenticated) {
            await removeFromUserCart(skuId)

            setCart((cart) =>
                cart ? removeItemFromCartState(cart, skuId) : cart
            )

            window.dispatchEvent(new Event('cart-updated'))
            return
        }

        removeFromGuestCart(skuId)

        setCart((cart) =>
            cart ? removeItemFromCartState(cart, skuId) : cart
        )

        window.dispatchEvent(new Event('cart-updated'))
    }

    const warnings = cart?.warnings ?? []

    function getWarningForItem(skuId: string) {
        return warnings.find((warning) => warning.skuId === skuId)
    }


    const hasBlockingWarnings = cart?.items.some((item) => {
        const warning = getWarningForItem(item.skuId)

        return (
            warning?.reason === 'OUT_OF_STOCK' ||
            warning?.reason === 'PRODUCT_NOT_AVAILABLE'
        )
    }) ?? false

    if (loading) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12">
                <p className="text-sm text-zinc-500">Loading cart...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-12">
                <div className="mt-6">
                    <button
                        onClick={() => navigate("/products")}
                        className="flex items-center gap-2 text-sm cursor-pointer font-medium text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4 cursor-pointer" />
                        Continue shopping
                    </button>
                </div>
                <div className="text-center">
                    <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-zinc-950">
                        🛒 Your cart
                    </h1>
                    <p className="mt-4 text-zinc-500">Your cart is empty.</p>
                </div>
                <CartRecommendations />
            </main>
        )
    }

    return (
        <main className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-teal-100 px-4 py-12 text-zinc-900">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-5xl">
                <button
                    onClick={() => navigate("/products")}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-zinc-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Continue shopping
                </button>

                {pendingPayment && (
                    <div className="mb-8 rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur">
                        <ResumePaymentBanner
                            orderId={pendingPayment.orderId}
                            remainingTime={remainingTime ?? undefined}
                        />
                    </div>
                )}

                <div className="mb-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 shadow-inner">
                        <span className="text-3xl">🛒</span>
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-zinc-950">
                        Your cart
                    </h1>

                    <p className="mt-2 text-sm font-medium text-zinc-500">
                        Review your items before checkout
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        {cart.items.map((item) => {
                            const warning = getWarningForItem(item.skuId)

                            const isBlockingWarning =
                                warning?.reason === "OUT_OF_STOCK" ||
                                warning?.reason === "PRODUCT_NOT_AVAILABLE"

                            return (
                                <div
                                    key={item.skuId}
                                    className="group flex gap-4 rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-inner">
                                        <img
                                            src={item.imageUrl ?? ""}
                                            alt={item.name}
                                            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                                {item.brandName}
                                            </p>

                                            <h2 className="mt-1 line-clamp-2 font-bold text-zinc-950">
                                                {item.name}
                                            </h2>

                                            <p className="mt-1 text-sm text-zinc-500">
                                                {item.colorName} · EU {item.sizeEU}
                                            </p>

                                            {warning && (
                                                <p
                                                    className={
                                                        isBlockingWarning
                                                            ? "mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                                                            : "mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
                                                    }
                                                >
                                                    {warning.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 p-1 shadow-sm">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item.skuId, item.quantity - 1)
                                                    }
                                                    disabled={item.quantity <= 1 || isBlockingWarning}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-zinc-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    -
                                                </button>

                                                <span className="w-8 text-center text-sm font-bold text-zinc-950">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item.skuId, item.quantity + 1)
                                                    }
                                                    disabled={
                                                        item.quantity >= item.availableQuantity ||
                                                        isBlockingWarning
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-zinc-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.skuId)}
                                                className="group/remove flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden text-right text-base font-black text-zinc-950 sm:block">
                                        {(item.lineTotalCents / 100).toFixed(2)} {item.currency}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <aside className="h-fit rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur lg:sticky lg:top-24">
                        <h2 className="text-xl font-black tracking-tight text-zinc-950">
                            Order summary
                        </h2>

                        <div className="mt-6 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-zinc-500">Subtotal</span>
                                <span className="font-bold text-zinc-900">
                                    {(cart.subtotalCents / 100).toFixed(2)} EUR
                                </span>
                            </div>
                        </div>

                        <div className="my-6 h-px bg-gradient-to-r from-emerald-200 via-zinc-200 to-transparent" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-zinc-950">Total</p>
                                <p className="text-xs text-zinc-500">VAT included</p>
                            </div>

                            <span className="text-2xl font-black text-zinc-950">
                                {(cart.subtotalCents / 100).toFixed(2)} EUR
                            </span>
                        </div>

                        <button
                            disabled={hasBlockingWarnings}
                            onClick={() => navigate("/checkout")}
                            className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none disabled:hover:translate-y-0"
                        >
                            🔒 Go to checkout
                        </button>

                        {hasBlockingWarnings && (
                            <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                                Remove unavailable items before checkout.
                            </p>
                        )}

                        <button
                            onClick={clearCart}
                            className="mt-4 w-full rounded-2xl border border-red-200 bg-white/70 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                            Clear cart
                        </button>
                    </aside>
                </div>

                <div className="mt-14">
                    <CartRecommendations />
                </div>
            </div>
        </main>
    )
}
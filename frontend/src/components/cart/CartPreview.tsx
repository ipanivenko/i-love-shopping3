import { useCartPreview } from './useCartPreview'

export default function QuickCartPreview() {
    const { items, totalCents, loading } = useCartPreview()

    return (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold">Cart preview</h3>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-zinc-500">Your cart is empty.</p>
            ) : (
                <>
                    <div className="max-h-72 space-y-3 overflow-y-auto">
                        {items.slice(0, 4).map((item: any) => (
                            <div key={item.skuId} className="flex gap-3">
                                <img
                                    src={item.imageUrl ?? '/placeholder.png'}
                                    alt={item.name}
                                    className="h-14 w-14 rounded-md object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-zinc-500">
                                        Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {((item.lineTotalCents ?? item.priceCents * item.quantity) / 100).toFixed(2)} €
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t pt-3">
                        <div className="flex justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span>{(totalCents / 100).toFixed(2)} €</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getGuestCart } from './cartStorage'
import { getUserCart } from '../../api/cart/getUserCart'
import { previewCart } from '../../api/cart/guestCartVerify'

export function useCartPreview() {
    const { isAuthenticated } = useAuth()

    const [items, setItems] = useState<any[]>([])
    const [totalCents, setTotalCents] = useState(0)
    const [loading, setLoading] = useState(false)

    async function loadCartPreview() {
        try {
            setLoading(true)

            if (isAuthenticated) {
                const cart = await getUserCart()
                setItems(cart.items ?? [])
                setTotalCents(cart.subtotalCents ?? 0)
            } else {
                const localItems = getGuestCart()

                if (localItems.length === 0) {
                    setItems([])
                    setTotalCents(0)
                    return
                }

                const preview = await previewCart(localItems)
                setItems(preview.items ?? [])
                setTotalCents(preview.subtotalCents ?? 0)
            }
        } catch {
            setItems([])
            setTotalCents(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCartPreview()
    }, [isAuthenticated])

    useEffect(() => {
        window.addEventListener('cart-updated', loadCartPreview)

        return () => {
            window.removeEventListener('cart-updated', loadCartPreview)
        }
    }, [isAuthenticated])

    return {
        items,
        totalCents,
        loading,
        refresh: loadCartPreview,
    }
}
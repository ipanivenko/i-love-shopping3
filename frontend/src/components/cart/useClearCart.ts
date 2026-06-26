import { clearGuestCart } from "./cartStorage"
import type { Dispatch, SetStateAction } from "react"
import type { CartPreviewResponse } from "@app/shared/cart"
import { clearUserCart } from "../../api/cart/clearUserCart"
import { useAuth } from "../../context/AuthContext"

export function useClearCart(setCart: Dispatch<SetStateAction<CartPreviewResponse | null>>) {
  const { isAuthenticated } = useAuth()

  async function clearCart() {
    if (isAuthenticated) {
      await clearUserCart()
    }

    clearGuestCart()

     setCart({
      items: [],
      subtotalCents: 0,
      warnings: [],
    })

    // notify UI
    window.dispatchEvent(new Event("guest-cart-updated"))
  }

  return clearCart
}
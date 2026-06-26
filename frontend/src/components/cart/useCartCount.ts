import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getGuestCart } from "./cartStorage"
import { getUserCart } from "../../api/cart/getUserCart"
import { previewCart } from "../../api/cart/guestCartVerify"

export function useCartCount() {
  const { isAuthenticated } = useAuth()
  const [count, setCount] = useState(0)

  async function loadUserCartCount() {
    try {
      const cart = await getUserCart()
      const total = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      )
      setCount(total)
    } catch {
      setCount(0)
    }
  }

  async function loadGuestCartCount() {
    try {
      const localItems = getGuestCart()

      if (localItems.length === 0) {
        setCount(0)
        return
      }

      const preview = await previewCart(localItems)

      const total = preview.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      )

      setCount(total)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUserCartCount()
    } else {
      loadGuestCartCount()
    }
  }, [isAuthenticated])

  useEffect(() => {
    function handleUpdate() {
      if (isAuthenticated) {
        loadUserCartCount()
      } else {
        loadGuestCartCount()
      }
    }

    window.addEventListener("cart-updated", handleUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleUpdate)
    }
  }, [isAuthenticated])

  return count
}
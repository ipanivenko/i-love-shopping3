import { addToGuestCart } from "./cartStorage"
import { useAuth } from "../../context/AuthContext"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { addToUserCart } from "../../api/cart/addToUserCart"


type AddToCartButtonProps = {
  skuId?: string
  disabled?: boolean
}

export default function AddToCartButton({
  skuId,
  disabled = false,
}: AddToCartButtonProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate();

  async function handleAddToCart() {
    if (!skuId) return

    try {
      if (isAuthenticated) {
        await addToUserCart(skuId, 1)
        console.log('Added to user cart:', skuId)
      } else {
        addToGuestCart(skuId, 1)
        console.log('Added to guest cart:', skuId)
      }

      window.dispatchEvent(new Event('cart-updated'))

      toast('🛒 Item added', {
        action: {
          label: 'View cart',
          onClick: () => navigate('/cart'),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || !skuId}
      className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 
      active:bg-neutral-900 active:scale-95
      cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {!skuId ? 'Select a size' : 'Add to cart'}
    </button>
  )
}
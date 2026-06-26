import type { LocalCartItem } from "../../types/cart";
import type { CartPreviewResponse } from "@app/shared/cart";

const CART_KEY = "guest_cart";

export function getGuestCart(): LocalCartItem[] {
  const raw = localStorage.getItem(CART_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as LocalCartItem[];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToGuestCart(skuId: string, quantity = 1) {
  const cart = getGuestCart();

  const existing = cart.find((item) => item.skuId === skuId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ skuId, quantity });
  }

  saveGuestCart(cart);
  window.dispatchEvent(new Event("cart-updated"))

  return cart;
}

export function updateGuestCartQuantity(skuId: string, quantity: number) {
  const cart = getGuestCart()

  const updatedCart = cart
    .map((item) =>
      item.skuId === skuId ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0)

  saveGuestCart(updatedCart)
  window.dispatchEvent(new Event('cart-updated'))

  return updatedCart
}

export function removeFromGuestCart(skuId: string) {
  const cart = getGuestCart().filter((item) => item.skuId !== skuId)

  saveGuestCart(cart)
  window.dispatchEvent(new Event('cart-updated'))

  return cart
}


export function recalculateGuestCart(
  cart: CartPreviewResponse,
  skuId: string,
  quantity: number
): CartPreviewResponse {
  const nextItems = cart.items
    .map((item) => {
      if (item.skuId !== skuId) return item;

      const nextQuantity = Math.max(1, quantity);

      return {
        ...item,
        quantity: nextQuantity,
        lineTotalCents: item.priceCents * nextQuantity,
      };
    })
    .filter((item) => item.quantity > 0);

  const subtotalCents = nextItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );

  return {
    ...cart,
    items: nextItems,
    subtotalCents,
  };
}

export function removeItemFromCartState(
  cart: CartPreviewResponse,
  skuId: string
): CartPreviewResponse {
  const nextItems = cart.items.filter(
    (item) => item.skuId !== skuId
  )

  const subtotalCents = nextItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  )

  return {
    ...cart,
    items: nextItems,
    subtotalCents,
  }
}


export function clearGuestCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"))
}

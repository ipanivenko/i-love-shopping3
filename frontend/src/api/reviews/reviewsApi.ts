import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"
import { getAccessToken } from "../auth/tokenStore"

export async function getProductReviews(productId: string) {
  const token = getAccessToken()

  if (token) {
    return apiFetch(`${API}/products/${productId}/reviews`)
  }

  return fetch(`${API}/products/${productId}/reviews`)
}


export async function createProductReview(
  productId: string,
  rating: number,
  comment?: string,
) {
  return apiFetch(`${API}/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export async function markReviewHelpful(reviewId: string) {
  return apiFetch(`${API}/reviews/${reviewId}/helpful`, {
    method: "POST",
  })
}

export async function removeReviewHelpful(reviewId: string) {
  return apiFetch(`${API}/reviews/${reviewId}/helpful`, {
    method: "DELETE",
  })
}
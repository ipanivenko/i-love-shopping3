import { useEffect, useState } from "react"
import {
    createProductReview,
    getProductReviews,
    markReviewHelpful,
    removeReviewHelpful
} from "../../api/reviews/reviewsApi"
import { useAuth } from "../../context/AuthContext"

type Review = {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
        id: string
        name: string | null
    }
    _count: {
        helpfulVotes: number
    }

    hasMarkedHelpful: boolean
}

type ProductReviewsResponse = {
    averageRating: number
    reviewCount: number
    canReview: boolean
    hasReviewed: boolean
    hasMarkedHelpful: boolean
    reviews: Review[]
}

type ProductReviewsProps = {
    productId: string
}

export function ProductReviews({
    productId,
}: ProductReviewsProps) {
    console.log(productId)

    const [data, setData] = useState<ProductReviewsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const { isAuthenticated, isAuthLoading } = useAuth()
    

    async function loadReviews() {
        if (!productId) return
        if (isAuthLoading) return
        

        try {
            setLoading(true)
            setError("")
            const res = await getProductReviews(productId)
            console.log("status", res.status)
            const result = await res.json()
            console.log("reviews response", result)
            setData(result)
        } catch {
            setError("Could not load reviews.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
  if (isAuthLoading) return

  loadReviews()
}, [productId, isAuthLoading, isAuthenticated])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!productId) return

        try {
            setSubmitting(true)
            await createProductReview(productId, rating, comment)
            setRating(5)
            setComment("")
            await loadReviews()
        } catch {
            setError("Could not submit review.")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleHelpful(review: Review) {
        try {
            if (review.hasMarkedHelpful) {
                await removeReviewHelpful(review.id)
            } else {
                await markReviewHelpful(review.id)
            }

            await loadReviews()
        } catch {
            setError("Could not update helpful vote.")
        }
    }

    if (loading) {
        return (
            <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6">
                Loading reviews...
            </div>
        )
    }

    if (error && !data) {
        return (
            <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 text-red-600">
                {error}
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Customer reviews</h2>
                <p className="text-sm text-zinc-600">
                    ⭐ {data.averageRating.toFixed(1)} / 5 based on {data.reviewCount} review
                    {data.reviewCount !== 1 ? "s" : ""}
                </p>
            </div>

            {error && (
                <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {data.canReview && !data.hasReviewed && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                >
                    <h3 className="mb-3 font-semibold">Leave feedback</h3>

                    <div className="mb-3 flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-2xl text-yellow-500"
                            >
                                {star <= rating ? "★" : "☆"}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review..."
                        className="mb-3 min-h-28 w-full rounded-xl border border-zinc-200 bg-white p-3 outline-none focus:border-emerald-500"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </button>
                </form>
            )}

            {!data.canReview && !data.hasReviewed && (
                <p className="mb-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                    Only registered customers who bought this product can leave a review.
                </p>
            )}

            {data.hasReviewed && (
                <p className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    You already reviewed this product.
                </p>
            )}

            <div className="space-y-4">
                {data.reviews.length === 0 ? (
                    <p className="text-sm text-zinc-600">No reviews yet.</p>
                ) : (
                    data.reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-2xl border border-zinc-100 bg-white p-4"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">
                                        {review.user.name ?? "Customer"}
                                    </p>

                                    <p className="text-sm text-yellow-500">
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </p>
                                </div>

                                <p className="text-xs text-zinc-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {review.comment && (
                                <p className="mb-3 text-sm text-zinc-700">{review.comment}</p>
                            )}

                            <button
                                type="button"
                                disabled={!isAuthenticated}
                                title={
                                    !isAuthenticated
                                        ? "Please sign in to vote"
                                        : undefined
                                }
                                onClick={() => handleHelpful(review)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${review.hasMarkedHelpful
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                    } ${!isAuthenticated
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                    }`}
                            >
                                👍 {review._count.helpfulVotes}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
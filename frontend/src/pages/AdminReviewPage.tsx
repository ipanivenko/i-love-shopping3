import { useEffect, useState } from 'react'
import {
    deleteAdminReview,
    getAdminReviews,
    updateAdminReview,
    type AdminReview,
} from '../api/admin/adminReviews'
import { BackToDashboardButton } from '../components/admin/AdminButtons'
import { useAuth } from '../context/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function getHelpfulCount(review: AdminReview) {
    return review.helpfulVotes?.length ?? 0
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<AdminReview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [pageError, setPageError] = useState<string | null>(null)

    const [editingReview, setEditingReview] = useState<AdminReview | null>(null)
    const [editRating, setEditRating] = useState(5)
    const [editComment, setEditComment] = useState('')

    const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const { isAuthLoading } = useAuth()

    async function loadReviews() {
        try {
            setPageError(null)
            setIsLoading(true)

            const data = await getAdminReviews()
            setReviews(data)
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to load reviews',
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadReviews()
    }, [])

    function openEditModal(review: AdminReview) {
        setEditingReview(review)
        setEditRating(review.rating)
        setEditComment(review.comment ?? '')
    }

    async function handleUpdateReview() {
        if (!editingReview) return

        try {
            setIsSaving(true)
            setPageError(null)

            await updateAdminReview(editingReview.id, {
                rating: editRating,
                comment: editComment.trim() || undefined,
            })

            setEditingReview(null)
            await loadReviews()
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to update review',
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteReview() {
        if (!reviewToDelete) return

        try {
            setIsSaving(true)
            setPageError(null)

            await deleteAdminReview(reviewToDelete.id)

            setReviewToDelete(null)
            await loadReviews()
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to delete review',
            )
        } finally {
            setIsSaving(false)
        }
    }

    if (isAuthLoading) {
        return (
            <main className="flex min-h-[50vh] items-center justify-center p-6">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading page...
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="space-y-6 p-4 sm:p-6">
            <BackToDashboardButton />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950">
                        Reviews
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View, edit, and delete customer reviews.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadReviews}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            {pageError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    ⚠️ {pageError}
                </div>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="p-6 text-sm text-slate-500">
                        Loading reviews...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">
                        No reviews found.
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Rating</th>
                                        <th className="px-4 py-3">Comment</th>
                                        <th className="px-4 py-3">Helpful</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {reviews.map((review) => (
                                        <tr key={review.id}>
                                            <td className="px-4 py-4 font-medium text-slate-950">
                                                {review.product.name}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                <div>{review.user.name ?? 'No name'}</div>
                                                <div className="text-xs text-slate-400">
                                                    {review.user.email}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-slate-700">
                                                ⭐ {review.rating}/5
                                            </td>

                                            <td className="max-w-sm px-4 py-4 text-slate-600">
                                                <p className="line-clamp-3">
                                                    {review.comment || 'No comment'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {getHelpfulCount(review)}
                                            </td>

                                            <td className="px-4 py-4 text-slate-500">
                                                {formatDate(review.createdAt)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(review)}
                                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setReviewToDelete(review)}
                                                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 lg:hidden">
                            {reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="rounded-2xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold text-slate-950">
                                                {review.product.name}
                                            </h2>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {review.user.name ?? 'No name'} · {review.user.email}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            ⭐ {review.rating}/5
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm text-slate-700">
                                        {review.comment || 'No comment'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                        <span>{formatDate(review.createdAt)}</span>
                                        <span>{getHelpfulCount(review)} helpful votes</span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(review)}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setReviewToDelete(review)}
                                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-950">
                            Edit review
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {editingReview.product.name}
                        </p>

                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">
                                    Rating
                                </span>

                                <select
                                    value={editRating}
                                    onChange={(event) => setEditRating(Number(event.target.value))}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                >
                                    <option value={5}>5 stars</option>
                                    <option value={4}>4 stars</option>
                                    <option value={3}>3 stars</option>
                                    <option value={2}>2 stars</option>
                                    <option value={1}>1 star</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">
                                    Comment
                                </span>

                                <textarea
                                    value={editComment}
                                    onChange={(event) => setEditComment(event.target.value)}
                                    rows={5}
                                    className="mt-1 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                    placeholder="Review comment"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setEditingReview(null)}
                                disabled={isSaving}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateReview}
                                disabled={isSaving}
                                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {isSaving ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reviewToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-950">
                            Delete review?
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            This will permanently delete the review for{' '}
                            <span className="font-semibold">
                                {reviewToDelete.product.name}
                            </span>
                            .
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setReviewToDelete(null)}
                                disabled={isSaving}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteReview}
                                disabled={isSaving}
                                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isSaving ? 'Deleting...' : 'Delete review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
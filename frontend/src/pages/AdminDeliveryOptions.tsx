import { useEffect, useState } from 'react'
import {
    createAdminShippingMethod,
    deleteAdminShippingMethod,
    getAdminShippingMethods,
    updateAdminShippingMethod,
    type ShippingMethod,
    type ShippingMethodPayload,
} from '../api/admin/shippingMethods'
import { BackToDashboardButton } from '../components/admin/AdminButtons'
import { useAuth } from '../context/AuthContext'

const emptyForm: ShippingMethodPayload = {
    name: '',
    code: '',
    description: '',
    priceCents: 0,
    currency: 'EUR',
    estimatedDaysMin: null,
    estimatedDaysMax: null,
    isActive: true,
}

function formatPrice(priceCents: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(priceCents / 100)
}

export default function AdminDeliveryOptionsPage() {
    const [methods, setMethods] = useState<ShippingMethod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [pageError, setPageError] = useState<string | null>(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
    const [form, setForm] = useState<ShippingMethodPayload>(emptyForm)
    const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null)

    const [isDeleting, setIsDeleting] = useState(false)
    const { isAuthLoading } = useAuth()

    async function loadMethods() {
        try {
            setIsLoading(true)
            setPageError(null)

            const data = await getAdminShippingMethods()
            setMethods(data)
        } catch (error) {
            setPageError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load delivery options',
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadMethods()
    }, [])

    function openCreateModal() {
        setEditingMethod(null)
        setForm(emptyForm)
        setIsModalOpen(true)
    }

    function openEditModal(method: ShippingMethod) {
        setEditingMethod(method)
        setForm({
            name: method.name,
            code: method.code,
            description: method.description ?? '',
            priceCents: method.priceCents,
            currency: method.currency,
            estimatedDaysMin: method.estimatedDaysMin ?? null,
            estimatedDaysMax: method.estimatedDaysMax ?? null,
            isActive: method.isActive,
        })
        setIsModalOpen(true)
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        try {
            setIsSaving(true)
            setPageError(null)

            const payload: ShippingMethodPayload = {
                ...form,
                code: form.code.trim().toUpperCase(),
                description: form.description?.trim() || undefined,
                estimatedDaysMin:
                    form.estimatedDaysMin === null
                        ? null
                        : Number(form.estimatedDaysMin),
                estimatedDaysMax:
                    form.estimatedDaysMax === null
                        ? null
                        : Number(form.estimatedDaysMax),
                priceCents: Number(form.priceCents),
            }

            if (editingMethod) {
                await updateAdminShippingMethod(editingMethod.id, payload)
            } else {
                await createAdminShippingMethod(payload)
            }

            setIsModalOpen(false)
            await loadMethods()
        } catch (error) {
            setPageError(
                error instanceof Error
                    ? error.message
                    : 'Failed to save delivery option',
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete() {
        if (!methodToDelete) return

        try {
            setIsDeleting(true)
            setPageError(null)

            await deleteAdminShippingMethod(methodToDelete.id)

            setMethodToDelete(null)

            await loadMethods()
        } catch (error) {
            setPageError(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete delivery option',
            )
        } finally {
            setIsDeleting(false)
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
        <main className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-6xl">
                <BackToDashboardButton />
                <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                            Admin
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-950">
                            Delivery options
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage shipping methods, prices and delivery estimates.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Add delivery option
                    </button>
                </div>

                {pageError && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {pageError}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
                        Loading delivery options...
                    </div>
                ) : methods.length === 0 ? (
                    <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-950">
                            No delivery options yet
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Add your first shipping method to start checkout delivery setup.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {methods.map((method) => (
                            <article
                                key={method.id}
                                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-lg font-bold text-slate-950">
                                                {method.name}
                                            </h2>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {method.code}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${method.isActive
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {method.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {method.description && (
                                            <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                                {method.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                            <span className="rounded-2xl bg-slate-50 px-4 py-2 font-medium text-slate-700">
                                                Price: {formatPrice(method.priceCents, method.currency)}
                                            </span>

                                            <span className="rounded-2xl bg-slate-50 px-4 py-2 font-medium text-slate-700">
                                                Estimate:{' '}
                                                {method.estimatedDaysMin && method.estimatedDaysMax
                                                    ? `${method.estimatedDaysMin}-${method.estimatedDaysMax} days`
                                                    : 'Not defined'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(method)}
                                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setMethodToDelete(method)}
                                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">
                                    {editingMethod ? 'Edit delivery option' : 'Add delivery option'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Configure the option customers will see at checkout.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 hover:bg-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-slate-700">
                                Name
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="Standard delivery"
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                                Code
                                <input
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    required
                                    placeholder="STANDARD"
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                                Price cents
                                <input
                                    type="number"
                                    min="0"
                                    value={form.priceCents}
                                    onChange={(e) =>
                                        setForm({ ...form, priceCents: Number(e.target.value) })
                                    }
                                    required
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                                Currency
                                <input
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                    required
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                                Min days
                                <input
                                    type="number"
                                    min="0"
                                    value={form.estimatedDaysMin ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            estimatedDaysMin: e.target.value === '' ? null : Number(e.target.value),
                                        })
                                    }
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                                Max days
                                <input
                                    type="number"
                                    min="0"
                                    value={form.estimatedDaysMax ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            estimatedDaysMax: e.target.value === '' ? null : Number(e.target.value),
                                        })
                                    }
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="md:col-span-2 text-sm font-medium text-slate-700">
                                Description
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Delivered within 3 to 5 business days."
                                    className="mt-1 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                />
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700 md:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        setForm({ ...form, isActive: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                />
                                Active and visible to customers
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={isSaving}
                                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {isSaving ? 'Saving...' : 'Save option'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {methodToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                                🗑️
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Delete delivery option?
                                </h2>

                                <p className="text-sm text-slate-500">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">
                                {methodToDelete.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {methodToDelete.code}
                            </p>
                        </div>

                        <p className="mt-4 text-sm text-slate-500">
                            If this delivery option has been used in previous orders,
                            consider deactivating it instead of deleting it.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setMethodToDelete(null)}
                                disabled={isDeleting}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
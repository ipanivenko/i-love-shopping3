import { useState } from 'react'
import {
    uploadAdminProductColorImage,
    updateAdminProductColorImage,
    deleteAdminProductColorImage,
} from '../../api/admin/adminProductItem'

import type { Product } from '../../types/adminProduct'

type Color = Product['colors'][number]

type Props = {
    selectedColor: Color
    reloadProduct: () => Promise<void>
    setPageError: (message: string | null) => void
}

async function getResponseError(response: Response, fallback: string) {
    const data = await response.json().catch(() => null)
    return data?.message || fallback
}

export function ImagesSection({
    selectedColor,
    reloadProduct,
    setPageError,
}: Props) {
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageAlt, setImageAlt] = useState('')
    const [imageSortOrder, setImageSortOrder] = useState(1)

    const [editingImageId, setEditingImageId] = useState<string | null>(null)
    const [editImageAlt, setEditImageAlt] = useState('')
    const [editImageSortOrder, setEditImageSortOrder] = useState(0)
    const [imageToDelete, setImageToDelete] = useState<string | null>(null)

    async function handleUploadImage(event: React.FormEvent) {
        event.preventDefault()

        if (!imageFile) return

        try {
            setPageError(null)

            await uploadAdminProductColorImage(selectedColor.id, {
                image: imageFile,
                alt: imageAlt,
                sortOrder: imageSortOrder,
            })

            setImageFile(null)
            setImageAlt('')
            setImageSortOrder((prev) => prev + 1)

            await reloadProduct()
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to upload image',
            )
        }
    }

    async function handleUpdateImage(event: React.FormEvent) {
        event.preventDefault()

        if (!editingImageId) return

        try {
            setPageError(null)

            const response = await updateAdminProductColorImage(editingImageId, {
                alt: editImageAlt,
                sortOrder: editImageSortOrder,
            })

            if (!response.ok) {
                setPageError(await getResponseError(response, 'Failed to update image'))
                return
            }

            setEditingImageId(null)
            await reloadProduct()
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to update image',
            )
        }
    }

    function handleDeleteImageClick(imageId: string) {
        setImageToDelete(imageId)
    }

    async function handleDeleteImage(imageId: string) {
        try {
            setPageError(null)

            const response = await deleteAdminProductColorImage(imageId)

            if (!response.ok) {
                setPageError(await getResponseError(response, 'Failed to delete image'))
                return
            }

            await reloadProduct()
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to delete image',
            )
        }
    }

    return (
        <section className="rounded border p-4">
            <h2 className="mb-4 font-semibold">
                Images for {selectedColor.colorName}
            </h2>

            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                <form
                    onSubmit={handleUploadImage}
                    className="grid gap-4 lg:grid-cols-2"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Image
                        </label>

                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer rounded bg-black px-4 py-2 text-white">
                                Select image

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setImageFile(event.target.files?.[0] ?? null)
                                    }
                                    className="hidden"
                                />
                            </label>

                            <span className="truncate text-sm text-gray-600">
                                {imageFile?.name ?? 'No file selected'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Alt text
                        </label>

                        <input
                            value={imageAlt}
                            onChange={(event) => setImageAlt(event.target.value)}
                            placeholder="Black running shoe"
                            className="w-full rounded border p-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Sort order
                        </label>

                        <input
                            type="number"
                            value={imageSortOrder}
                            onChange={(event) =>
                                setImageSortOrder(Number(event.target.value))
                            }
                            className="w-full rounded border p-2"
                            min={0}
                            required
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full rounded bg-black px-4 py-2 text-white"
                        >
                            Upload image
                        </button>
                    </div>
                </form>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {selectedColor.images
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((image) => (
                        <div key={image.id} className="rounded border p-2">
                            <img
                                src={image.url}
                                alt={image.alt ?? ''}
                                className="h-40 w-full rounded object-cover"
                            />

                            {editingImageId === image.id ? (
                                <form onSubmit={handleUpdateImage} className="mt-3 space-y-2">
                                    <input
                                        value={editImageAlt}
                                        onChange={(event) => setEditImageAlt(event.target.value)}
                                        placeholder="Alt text"
                                        className="w-full rounded border p-2"
                                    />

                                    <input
                                        type="number"
                                        value={editImageSortOrder}
                                        onChange={(event) =>
                                            setEditImageSortOrder(Number(event.target.value))
                                        }
                                        className="w-full rounded border p-2"
                                        min={0}
                                    />

                                    <div className="flex gap-2">
                                        <button className="rounded bg-black px-3 py-2 text-sm text-white">
                                            Save
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setEditingImageId(null)}
                                            className="rounded border px-3 py-2 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="mt-2 text-sm">
                                        <p>Order: {image.sortOrder}</p>
                                        <p className="text-gray-500">{image.alt}</p>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingImageId(image.id)
                                                setEditImageAlt(image.alt ?? '')
                                                setEditImageSortOrder(image.sortOrder)
                                            }}
                                            className="rounded border px-3 py-2 text-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImageClick(image.id)}
                                            className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
            </div>


            {imageToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h3 className="text-lg font-semibold">
                            Delete image
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this image?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setImageToDelete(null)}
                                className="rounded border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    await handleDeleteImage(imageToDelete)
                                    setImageToDelete(null)
                                }}
                                className="rounded bg-red-600 px-4 py-2 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )



}
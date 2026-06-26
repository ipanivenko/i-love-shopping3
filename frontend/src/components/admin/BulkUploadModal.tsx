import { useState } from 'react'
import { bulkUploadProducts } from '../../api/admin/bulkUpload'

type UploadType = 'json' | 'csv'

type Props = {
  onClose: () => void
  onUploaded: () => Promise<void>
}

type BulkUploadResult = {
  total?: number
  successful?: number
  failed?: number
  results?: {
    name: string
    success: boolean
    productId?: string
    error?: string
  }[]
  statusCode?: number
  error?: string
  message?: string | string[] | unknown[]
  errors?: string[]
}

export function BulkProductUploadModal({ onClose, onUploaded }: Props) {
  const [uploadType, setUploadType] = useState<UploadType>('json')
  const [dataFile, setDataFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BulkUploadResult | null>(null)

  async function handleUpload() {
    if (!dataFile) {
      setError(`Please select a ${uploadType.toUpperCase()} file`)
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setResult(null)

      const response = await bulkUploadProducts(
        uploadType,
        dataFile,
        imageFiles,
      )

      // Read ONCE
      const body = await response.json().catch(() => ({
        message: 'Unable to parse server response',
      }))

      if (!response.ok) {
        setResult(body)   //  show backend error
        return
      }

      setResult(body)     //  show success result
      await onUploaded()
    } catch (error) {
      setResult({
        message:
          error instanceof Error
            ? error.message
            : 'Bulk upload failed',
      })
    } finally {
      setIsUploading(false)
    }
  }

  function resetForm() {
    setDataFile(null)
    setImageFiles([])
    setError(null)
    setResult(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Bulk product upload
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload a JSON or CSV file with matching product images.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-gray-50 p-4">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              File type
            </label>

            <div className="flex gap-3">
              {(['json', 'csv'] as UploadType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setUploadType(type)
                    resetForm()
                  }}
                  className={
                    uploadType === type
                      ? 'rounded-lg bg-black px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
                  }
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-5 text-center hover:bg-gray-50">
              <span className="block text-sm font-medium text-gray-800">
                Choose {uploadType.toUpperCase()} file
              </span>

              <span className="mt-1 block text-xs text-gray-500">
                Required product data file
              </span>

              <input
                key={uploadType}
                type="file"
                accept={
                  uploadType === 'json'
                    ? '.json,application/json'
                    : '.csv,text/csv'
                }
                onChange={(event) => {
                  setDataFile(event.target.files?.[0] ?? null)
                  setResult(null)
                  setError(null)
                }}
                className="hidden"
              />

              {dataFile ? (
                <span className="mt-4 block truncate rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {dataFile.name}
                </span>
              ) : (
                <span className="mt-4 block text-sm text-gray-400">
                  No file selected
                </span>
              )}
            </label>

            <label className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-5 text-center hover:bg-gray-50">
              <span className="block text-sm font-medium text-gray-800">
                Choose images
              </span>

              <span className="mt-1 block text-xs text-gray-500">
                Optional, multiple files allowed
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  setImageFiles(Array.from(event.target.files ?? []))
                  setResult(null)
                  setError(null)
                }}
                className="hidden"
              />

              {imageFiles.length > 0 ? (
                <div className="mt-4 max-h-32 space-y-1 overflow-y-auto rounded-lg bg-blue-50 px-3 py-2 text-left text-sm text-blue-700">
                  {imageFiles.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="truncate">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="mt-4 block text-sm text-gray-400">
                  No images selected
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !dataFile}
              className="flex-1 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? 'Uploading products...' : 'Upload products'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isUploading}
              className="rounded-xl border px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Upload failed</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div
              className={
                result.statusCode || result.error
                  ? 'mt-4 rounded-lg bg-red-50 p-4'
                  : 'mt-4 rounded-lg bg-green-50 p-4'
              }
            >
              <h3
                className={
                  result.statusCode || result.error
                    ? 'font-semibold text-red-800'
                    : 'font-semibold text-green-800'
                }
              >
                {result.statusCode || result.error ? 'Upload failed' : 'Upload finished'}
              </h3>

              {typeof result.message === 'string' && (
                <p className="mt-2 text-sm">
                  {result.message}
                </p>
              )}

              {Array.isArray(result.message) && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                  {result.message.map((item, index) => (
                    <li key={index}>
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              )}

              {result.total !== undefined && (
                <p className="mt-2 text-sm">
                  Total: {result.total} | Successful: {result.successful} | Failed:{' '}
                  {result.failed}
                </p>
              )}

              {result.results && result.results.length > 0 && (
                <div className="mt-3 rounded-lg bg-white p-3">
                  <p className="font-medium">Results</p>

                  <ul className="mt-2 space-y-1 text-sm">
                    {result.results.map((item, index) => (
                      <li
                        key={index}
                        className={item.success ? 'text-green-700' : 'text-red-700'}
                      >
                        {item.name}: {item.success ? 'Created' : item.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                  {result.errors.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
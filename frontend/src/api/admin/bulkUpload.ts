import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function bulkUploadProducts(
  uploadType: 'json' | 'csv',
  dataFile: File,
  imageFiles: File[],
) {
  const formData = new FormData()

  if (uploadType === 'json') {
    formData.append('json', dataFile)
  }

  if (uploadType === 'csv') {
    formData.append('csv', dataFile)
  }

  for (const imageFile of imageFiles) {
    formData.append('images', imageFile)
  }

  const endpoint =
    uploadType === 'json'
      ? `${API}/admin/products/bulk-json`
      : `${API}/admin/products/bulk-csv`

  return apiFetch(endpoint, {
    method: 'POST',
    body: formData,
  })
}
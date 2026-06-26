import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/ui/Container'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsFiltersSidebar from '../components/products/ProductsFiltersSidebar'
import ProductsGrid from '../components/products/ProductsGrid'
import ProductsPagination from '../components/products/ProductsPagination'
import { useSearchParams } from 'react-router'
import { useProductsFilters } from '../api/products/hook'
import { useProducts } from '../api/products/fetchProductsFromUrl'
import { useState } from 'react'


export default function ProductsPage() {

  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isLoading } = useProductsFilters()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const sortBy = searchParams.get("sortBy")
  const sortOrder = searchParams.get("sortOrder")

  const selectedBrands = searchParams.getAll('brand')
  const selectedGenders = searchParams.getAll('gender')
  const selectedSurfaces = searchParams.getAll('surface')
  const ratingAvgMin = searchParams.get('ratingAvgMin') ?? ''
  const priceMin = searchParams.get('priceMin') ?? ''
  const priceMax = searchParams.get('priceMax') ?? ''
  const query = searchParams.get('query') ?? ''
  const page = Number(searchParams.get("page") ?? 1)

  const { products, pagination, loading, error } = useProducts(searchParams.toString())


  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  function handleApplyFilters(filters: {
    brands: string[]
    genders: string[]
    surfaces: string[]
    ratingAvgMin?: number
    priceMin?: number
    priceMax?: number
  }) {
    const params = new URLSearchParams(searchParams)

    params.delete('brand')
    params.delete('gender')
    params.delete('surface')
    params.delete('ratingAvgMin')
    params.delete('priceMin')
    params.delete('priceMax')
    params.set('page', '1')

    filters.brands.forEach((brand) => params.append('brand', brand))
    filters.genders.forEach((gender) => params.append('gender', (gender.toUpperCase())))
    filters.surfaces.forEach((surface) => params.append('surface', surface))

    if (filters.ratingAvgMin !== undefined) {
      params.set('ratingAvgMin', String(filters.ratingAvgMin))
    }

    if (filters.priceMin !== undefined) {
      params.set('priceMin', String(filters.priceMin))
    }

    if (filters.priceMax !== undefined) {
      params.set('priceMax', String(filters.priceMax))
    }

    setSearchParams(params)
  }

  function handleClearFilters() {
    const params = new URLSearchParams(searchParams)

    params.delete('brand')
    params.delete('gender')
    params.delete('surface')
    params.delete('ratingAvgMin')
    params.delete('priceMin')
    params.delete('priceMax')
    params.set('page', '1')

    setSearchParams(params)
  }

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams)

    if (value === 'price-asc') {
      params.set('sortBy', 'price')
      params.set('sortOrder', 'asc')
    } else if (value === 'price-desc') {
      params.set('sortBy', 'price')
      params.set('sortOrder', 'desc')
    } else if (value === 'rating-desc') {
      params.set('sortBy', 'rating')
      params.set('sortOrder', 'desc')
    } else if (value === 'newest-desc') {
      params.set('sortBy', 'createdAt')
      params.set('sortOrder', 'desc')
    } else if (value === 'relevance') {
      params.set('sortBy', 'relevance')
      params.delete('sortOrder')
    }

    params.set('page', '1')
    setSearchParams(params)
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(newPage))
    setSearchParams(params)
  }

  let sortValue = "newest-desc"

  if (sortBy === "price" && sortOrder === "asc") {
    sortValue = "price-asc"
  }

  if (sortBy === "price" && sortOrder === "desc") {
    sortValue = "price-desc"
  }

  if (sortBy === "rating") {
    sortValue = "rating-desc"
  }

  if (sortBy === "relevance") {
    sortValue = "relevance"
  }


  const totalPages = Math.ceil(
    (pagination?.total ?? 0) / (pagination?.pageSize ?? 1)
  )

  const totalProducts = pagination?.total



  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-teal-100 text-zinc-900">
      <Header />

      <main className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <Container>
          <div className="relative grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside>
              {isLoading ? (
                <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur">
                  <p className="text-sm text-zinc-600">Loading filters...</p>
                </div>
              ) : (
                <div className="sticky top-24 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-emerald-900/5 backdrop-blur">
                  <ProductsFiltersSidebar
                    brandOptions={data?.brands ?? []}
                    surfaceOptions={data?.surfaces ?? []}
                    selectedBrands={selectedBrands}
                    selectedGenders={selectedGenders}
                    selectedSurfaces={selectedSurfaces}
                    ratingAvgMin={ratingAvgMin}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                  />
                </div>
              )}
            </aside>

            <section>
              <div className="mb-6 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-zinc-900/5 backdrop-blur">
                <ProductsToolbar
                  total={totalProducts}
                  query={query}
                  sortValue={sortValue}
                  onSortChange={handleSortChange}
                />

              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur">
                <div className="mb-4 flex justify-end gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'grid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-zinc-700'
                      }`}
                  >
                    Grid
                  </button>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'list'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-zinc-700'
                      }`}
                  >
                    List
                  </button>
                </div>
                
                <ProductsGrid
                  products={products}
                  viewMode={viewMode}
                />
              </div>

              <div className="mt-8 flex justify-center">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-lg shadow-zinc-900/5 backdrop-blur">
                  <ProductsPagination
                    page={page ?? 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
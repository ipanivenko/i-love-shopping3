import { Link } from 'react-router-dom'

export function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Management</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/products"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Products</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create, edit and archive products.
            </p>
          </Link>

          <Link
            to="/admin/brands"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Brands</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create and manage brands.
            </p>
          </Link>

          <Link
            to="/admin/categories"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Categories</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create and manage categories.
            </p>
          </Link>

          <Link
            to="/admin/delivery-options"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Delivery Options</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create and manage delivery methods.
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Orders</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage orders, cancellations and refunds.
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Users</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage user accounts and roles.
            </p>
          </Link>

          <Link
            to="/admin/reviews"
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
          >
            <h3 className="font-semibold">Reviews</h3>
            <p className="mt-2 text-sm text-gray-500">
              Edit and delete customer reviews.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
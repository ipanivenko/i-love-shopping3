import { useEffect, useMemo, useState } from 'react'
import {
  approveAdminOrderCancellation,
  getAdminOrders,
  rejectAdminOrderCancellation,
  updateAdminOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from '../api/admin/orders'
import { OrderDetailsModal } from '../components/admin/OrderDetailsModal'
import { OrderStatusBadge } from '../components/admin/OrderStatusBadge'
import { BackToDashboardButton } from '../components/admin/AdminButtons'
import { useAuth } from '../context/AuthContext'

const editableStatuses: OrderStatus[] = [
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

const filterStatuses: Array<'ALL' | OrderStatus> = [
  'ALL',
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'PAYMENT_SUCCESSFUL',
  'PAYMENT_EXPIRED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCEL_REQUESTED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100)
}

function formatStatus(status: string) {
  return status.replaceAll('_', ' ')
}

function isSameOrAfter(date: Date, filterDate: string) {
  if (!filterDate) return true

  const start = new Date(`${filterDate}T00:00:00`)
  return date >= start
}

function isSameOrBefore(date: Date, filterDate: string) {
  if (!filterDate) return true

  const end = new Date(`${filterDate}T23:59:59`)
  return date <= end
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { isAuthLoading } = useAuth()

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)

      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter

      const matchesFromDate = isSameOrAfter(orderDate, fromDate)
      const matchesToDate = isSameOrBefore(orderDate, toDate)

      return matchesStatus && matchesFromDate && matchesToDate
    })
  }, [orders, statusFilter, fromDate, toDate])

  function resetFilters() {
    setStatusFilter('ALL')
    setFromDate('')
    setToDate('')
  }

  async function loadOrders() {
    try {
      setIsLoading(true)
      setPageError(null)

      const data = await getAdminOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    try {
      setSavingOrderId(orderId)
      setPageError(null)

      await updateAdminOrderStatus(orderId, {
        status,
        note: `Status updated by admin to ${status}`,
      })

      await loadOrders()
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setSavingOrderId(null)
    }
  }

  async function handleApproveCancellation(orderId: string) {
    try {
      setSavingOrderId(orderId)
      setPageError(null)

      await approveAdminOrderCancellation(orderId, 'Cancellation approved by admin')
      await loadOrders()
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Failed to approve cancellation',
      )
    } finally {
      setSavingOrderId(null)
    }
  }

  async function handleRejectCancellation(orderId: string) {
    try {
      setSavingOrderId(orderId)
      setPageError(null)

      await rejectAdminOrderCancellation(orderId, {
        note: 'Cancellation rejected by admin',
      })

      await loadOrders()
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Failed to reject cancellation',
      )
    } finally {
      setSavingOrderId(null)
    }
  }

  function renderActions(order: AdminOrder) {
    return (
      <div className="flex flex-wrap justify-end gap-2 sm:justify-start lg:justify-end">
        {order.status === 'CANCEL_REQUESTED' && (
          <>
            <button
              onClick={() => handleApproveCancellation(order.id)}
              disabled={savingOrderId === order.id}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve
            </button>

            <button
              onClick={() => handleRejectCancellation(order.id)}
              disabled={savingOrderId === order.id}
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}

        <button
          onClick={() => setSelectedOrder(order)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
        >
          View
        </button>
      </div>
    )
  }

  if (isLoading || isAuthLoading) {
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
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <BackToDashboardButton/>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Manage customer orders, statuses, and cancellation requests.
        </p>
      </div>

      {pageError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Status
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | OrderStatus)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-950"
            >
              {filterStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All statuses' : formatStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-950"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-950"
            />
          </label>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              Reset filters
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders.
        </p>
      </div>

      {/* Mobile layout */}
      <div className="space-y-4 lg:hidden">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Customer
                </p>
                <p className="font-medium text-slate-950">
                  {order.customerInfo?.name ?? 'Guest'}
                </p>
                <p className="break-all text-xs text-slate-500">
                  {order.customerInfo?.email ?? 'No email'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Total
                </p>
                <p className="font-semibold text-slate-950">
                  {formatPrice(order.totalCents, order.currency)}
                </p>
              </div>

              <select
                value=""
                disabled={savingOrderId === order.id}
                onChange={(e) =>
                  handleStatusChange(order.id, e.target.value as OrderStatus)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-950"
              >
                <option value="" disabled>
                  Change status
                </option>

                {editableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              {renderActions(order)}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-slate-500">
            No orders found.
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Update</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium">
                    {order.customerInfo?.name ?? 'Guest'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.customerInfo?.email ?? 'No email'}
                  </p>
                </td>

                <td className="px-5 py-4 font-semibold">
                  {formatPrice(order.totalCents, order.currency)}
                </td>

                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>

                <td className="px-5 py-4">
                  <select
                    value=""
                    disabled={savingOrderId === order.id}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as OrderStatus)
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-950"
                  >
                    <option value="" disabled>
                      Change status
                    </option>

                    {editableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-5 py-4">{renderActions(order)}</td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
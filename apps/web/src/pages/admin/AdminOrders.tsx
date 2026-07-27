import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

const statusFlow = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PACKED: 'bg-purple-100 text-purple-700 border-purple-200',
  SHIPPED: 'bg-amber-100 text-amber-700 border-amber-200',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    api.get(`/admin/orders?${params}`)
      .then(({ data }) => {
        setOrders(data.items)
        setTotalPages(data.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter])

  const advanceStatus = async (order: any) => {
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return
    const currentIdx = statusFlow.indexOf(order.status)
    if (currentIdx === -1 || currentIdx >= statusFlow.length - 1) return
    const nextStatus = statusFlow[currentIdx + 1]
    setUpdating(order.id)
    try {
      const { data: updated } = await api.patch(`/admin/orders/${order.id}/status`, { status: nextStatus })
      setOrders(orders.map(o => o.id === order.id ? updated : o))
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdating(null)
    }
  }

  const cancelOrder = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    setUpdating(id)
    try {
      const { data: updated } = await api.patch(`/admin/orders/${id}/status`, { status: 'CANCELLED' })
      setOrders(orders.map(o => o.id === id ? updated : o))
    } catch (err) {
      console.error('Failed to cancel:', err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders</p>
        </div>
        <div className="flex gap-2">
          {['', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                statusFilter === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s ? statusLabels[s] : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-5 w-48 bg-gray-100 rounded shimmer-bg mb-3" />
              <div className="h-4 w-32 bg-gray-100 rounded shimmer-bg" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    #{order.id.slice(2, 4)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.name || 'Guest'} <span className="text-gray-400 font-normal">• {order.user?.email}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Order #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); advanceStatus(order) }}
                      disabled={updating === order.id}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all whitespace-nowrap"
                    >
                      {updating === order.id ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      ) : (
                        `→ ${statusLabels[statusFlow[statusFlow.indexOf(order.status) + 1]] || statusFlow[statusFlow.indexOf(order.status) + 1]}`
                      )}
                    </button>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-300 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 space-y-4">
                      <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.product?.images?.[0] && (
                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">₹{Number(item.totalPrice).toLocaleString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
                          <div className="space-y-3">
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <>
                                <button
                                  onClick={() => advanceStatus(order)}
                                  disabled={updating === order.id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                                >
                                  {updating === order.id ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                  )}
                                  {updating === order.id ? 'Updating...' : `Mark as ${statusLabels[statusFlow[statusFlow.indexOf(order.status) + 1]] || statusFlow[statusFlow.indexOf(order.status) + 1]}`}
                                </button>
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={updating === order.id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-all"
                                >
                                  Cancel Order
                                </button>
                              </>
                            )}
                            {order.status === 'DELIVERED' && (
                              <div className="space-y-3">
                                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                  <p className="text-sm font-medium text-emerald-700">✓ Delivered successfully</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const token = localStorage.getItem('accessToken')
                                    fetch(`/api/orders/${order.id}/invoice`, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    })
                                      .then(res => res.ok ? res.blob() : Promise.reject())
                                      .then(blob => {
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `invoice-${order.id.slice(0, 8)}.html`
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                      })
                                      .catch(() => alert('Failed to download invoice'))
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                  Download Invoice
                                </button>
                              </div>
                            )}
                            {order.status === 'CANCELLED' && (
                              <div className="p-4 bg-red-50 rounded-xl text-center">
                                <p className="text-sm font-medium text-red-700">✕ Order cancelled</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Order {
  id: string; total: number; status: string; createdAt: string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

const statusSteps = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

function downloadInvoice(orderId: string) {
  const token = localStorage.getItem('accessToken')
  fetch(`/api/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to download invoice')
      return res.blob()
    })
    .then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId.slice(0, 8)}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
    .catch(() => alert('Failed to download invoice'))
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/orders').then(({ data }) => setOrders(data)).catch(() => {})
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view orders</h1>
        <Link to="/login" className="inline-flex items-center px-8 py-3.5 text-sm font-medium text-white bg-gray-900 rounded-full">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Your Orders</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link to="/products" className="mt-4 inline-block text-sm text-brand-600 font-medium">Start Shopping →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => {
              const statusIdx = statusSteps.indexOf(order.status as any)
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Order</p>
                      <p className="text-lg font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-brand-50 text-brand-700' :
                      order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>{order.status}</span>
                  </div>

                  <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                    {statusSteps.map((s, i) => (
                      <div key={s} className="flex items-center gap-1 flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i <= statusIdx ? 'bg-brand-500 text-white shadow-sm' : 'bg-gray-50 text-gray-300'
                        }`}>{i + 1}</div>
                        <span className={`text-[10px] font-medium ${i <= statusIdx ? 'text-brand-600' : 'text-gray-300'}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                        {i < statusSteps.length - 1 && <div className={`w-6 sm:w-10 h-0.5 ${i < statusIdx ? 'bg-brand-500' : 'bg-gray-100'}`} />}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-medium text-gray-900">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'DELIVERED' && (
                    <div className="mb-4">
                      <button
                        onClick={() => downloadInvoice(order.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download Invoice
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

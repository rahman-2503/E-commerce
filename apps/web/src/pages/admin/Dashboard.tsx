import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-indigo-500',
  PACKED: 'bg-purple-500',
  SHIPPED: 'bg-amber-500',
  OUT_FOR_DELIVERY: 'bg-orange-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  const statCards = [
    { key: 'revenue', label: 'Total Revenue', prefix: '₹', format: true, bg: 'from-emerald-50 to-teal-50' },
    { key: 'totalOrders', label: 'Orders', suffix: '', bg: 'from-blue-50 to-indigo-50' },
    { key: 'totalProducts', label: 'Products', suffix: '', bg: 'from-purple-50 to-pink-50' },
    { key: 'totalUsers', label: 'Users', suffix: '', bg: 'from-amber-50 to-orange-50' },
    { key: 'todayOrders', label: "Today's Orders", suffix: '', bg: 'from-rose-50 to-red-50' },
    { key: 'todayRevenue', label: "Today's Revenue", prefix: '₹', format: true, bg: 'from-cyan-50 to-sky-50' },
  ]

  const maxStatus = stats?.statusDistribution
    ? Math.max(...stats.statusDistribution.map((s: any) => s.count), 1)
    : 1

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400">Store overview</p>
        </div>
        {(stats?.recentOrders?.length > 0 || stats?.lowStockProducts?.length > 0) && (
          <div className="flex gap-2 text-xs text-gray-400">
            {stats.recentOrders.length > 0 && <span>{stats.recentOrders.length} recent orders</span>}
            {(stats?.lowStockProducts?.length ?? 0) > 0 && <span className="text-red-400">{stats.lowStockProducts.length} low stock</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative p-4 bg-white rounded-xl border border-gray-100 overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-40`} />
            <p className="text-[11px] text-gray-500 font-medium relative">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1 relative">
              {stats ? (
                <>{card.prefix || ''}{card.format ? Number(stats[card.key]).toLocaleString('en-IN') : stats[card.key]}{card.suffix || ''}</>
              ) : (
                <div className="h-6 w-16 bg-gray-100 rounded" />
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-5 gap-3 min-h-0 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-4 overflow-auto"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Status</h2>
          {stats?.statusDistribution?.length > 0 ? (
            <div className="space-y-2">
              {stats.statusDistribution.map((s: any) => (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium text-gray-600">{statusLabels[s.status] || s.status}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / maxStatus) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${statusColors[s.status] || 'bg-gray-500'}`}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-semibold text-gray-900">{s.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-xs py-6 text-center">No order data</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-4 overflow-auto"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Orders</h2>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-1.5">
              {stats.recentOrders.slice(0, 6).map((order: any, i: number) => (
                <div key={order.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      #{order.id.slice(2, 4)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{order.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-gray-400">#{order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-medium ${order.status === 'DELIVERED' ? 'text-emerald-600' : order.status === 'CANCELLED' ? 'text-red-500' : 'text-blue-600'}`}>{statusLabels[order.status] || order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-xs py-6 text-center">No orders yet</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 p-4 overflow-auto"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Low Stock</h2>
          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-1.5">
              {stats.lowStockProducts.slice(0, 6).map((product: any, i: number) => (
                <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-400">{product.category?.name}</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                    {product.variants?.reduce((a: number, v: any) => a + v.stock, 0) || 0} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-xs py-6 text-center">Well stocked</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

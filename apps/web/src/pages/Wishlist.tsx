import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
    rating: number
    reviewCount: number
  }
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = () => {
    setLoading(true)
    api.get('/wishlist')
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWishlist() }, [])

  const removeFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`)
      setItems(items.filter((i) => i.product.id !== productId))
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Saved Items</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2">My Wishlist</h1>
        <p className="text-gray-500 mt-1">{items.length} items saved</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Your wishlist is empty</p>
          <Link to="/products" className="mt-4 inline-block text-sm text-brand-600 font-medium">Browse Products →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <Link to={`/products/${item.product.slug}`}>
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={item.product.images?.[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Link to={`/products/${item.product.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-sm font-bold text-gray-900 mt-1">₹{item.product.basePrice.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-amber-500">★</span>
                    <span className="text-xs text-gray-500">{item.product.rating} ({item.product.reviewCount})</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

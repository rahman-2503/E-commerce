import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  rating: number
  reviewCount: number
  category: { id: string; name: string }
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('newest')
  const [categories, setCategories] = useState<any[]>([])
  const limit = 16

  const search = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || ''

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  const categoryId = categorySlug
    ? categories.find((c: any) => c.slug === categorySlug)?.id || ''
    : ''

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('categoryId', categoryId)
    params.set('sort', sort)
    params.set('page', page.toString())
    params.set('limit', limit.toString())

    api.get(`/products?${params}`)
      .then(({ data }) => {
        setProducts(data.items)
        setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, categoryId, sort, page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal>
            <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Collection</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3">
              {search ? `Results for "${search}"` : categorySlug ? categories.find((c: any) => c.slug === categorySlug)?.name || 'Category' : 'All Products'}
            </h1>
            <p className="text-gray-500 mt-3">{total} products found</p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams)
                  if (e.target.value) params.set('search', e.target.value)
                  else params.delete('search')
                  params.delete('category')
                  setSearchParams(params)
                  setPage(1)
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, Math.min(totalPages, 5)).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm font-medium rounded-xl transition-all ${
                  p === page ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-2xl" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import Product3DViewer from '@/components/product/Product3DViewer'
import ImageHoverSlider from '@/components/ui/ImageHoverSlider'

interface Product {
  id: string; name: string; slug: string; description: string; brand: string | null
  basePrice: number; images: string[]; rating: number; reviewCount: number; tags: string[]
  category: { id: string; name: string }
  variants: { id: string; name: string; price: number; stock: number; attributes: Record<string, string> }[]
  reviews: { id: string; rating: number; title: string; body: string; user: { name: string }; createdAt: string }[]
}

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data)
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0].id)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    const variant = product.variants?.find((v) => v.id === selectedVariant)
    addItem({
      productId: product.id,
      variantId: variant?.id || null,
      name: product.name,
      price: variant?.price || product.basePrice,
      quantity,
      image: product.images?.[0] || '',
      variantName: variant?.name,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 1000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Product not found</h1>
        <Link to="/products" className="mt-6 inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-full">Back to products</Link>
      </div>
    )
  }

  const currentVariant = product.variants?.find((v) => v.id === selectedVariant)
  const currentPrice = currentVariant?.price || product.basePrice
  const inStock = currentVariant ? currentVariant.stock > 0 : true

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden">
              {product.images?.length > 1 ? (
                <ImageHoverSlider images={product.images} className="w-full h-full" />
              ) : product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <Product3DViewer />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-500 transition-all cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {product.brand && (
              <p className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">{product.brand}</p>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">₹{currentPrice.toLocaleString('en-IN')}</span>
              {currentPrice !== product.basePrice && (
                <span className="text-lg text-gray-400 line-through">₹{product.basePrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

            {product.variants?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      disabled={v.stock <= 0}
                      className={`px-5 py-2.5 text-sm rounded-full border transition-all ${
                        selectedVariant === v.id
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : v.stock <= 0
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {v.name}
                      {v.stock <= 3 && v.stock > 0 && (
                        <span className="ml-1.5 text-[10px] text-amber-600">Only {v.stock} left</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-3.5 text-sm font-medium rounded-full transition-all ${
                  !inStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  added ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                }`}
              >
                <AnimatePresence mode="wait">
                  {!inStock ? (
                    <motion.span key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Out of Stock</motion.span>
                  ) : added ? (
                    <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ Added to Cart!</motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Add to Cart</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Free shipping on orders above ₹999
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                30-day returns
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-20">
          <div className="flex gap-8 border-b border-gray-100 mb-8">
            {['details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-medium transition-all relative ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'details' ? 'Product Details' : `Reviews (${product.reviews?.length || 0})`}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-6">
                {product.reviews?.length > 0 ? product.reviews.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.user.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">{review.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No reviews yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ImageHoverSlider from '@/components/ui/ImageHoverSlider'
import Hover3DCard from '@/components/ui/Hover3DCard'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
    rating: number
    reviewCount: number
    category?: { name: string }
  }
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Hover3DCard>
        <Link to={`/products/${product.slug}`} className="group block">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
            {product.images?.length > 0 ? (
              <ImageHoverSlider
                images={product.images}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
            {product.rating >= 4.5 && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-brand-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                Best Seller
              </div>
            )}
          </div>
          <div className="mt-4 px-1">
            {product.category && (
              <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mt-1 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold text-gray-900">
                ₹{product.basePrice.toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-400">{product.rating}</span>
              </div>
            </div>
          </div>
        </Link>
      </Hover3DCard>
    </motion.div>
  )
}

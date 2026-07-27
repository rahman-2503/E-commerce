import { useCartStore } from '@/store/cartStore'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart
                  <span className="text-gray-400 font-normal ml-1">({items.length})</span>
                </h2>
                <button onClick={closeCart} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                    <button onClick={closeCart} className="mt-4 text-sm text-brand-600 font-medium hover:text-brand-700">
                      <Link to="/products">Continue Shopping →</Link>
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 py-5 border-b border-gray-50"
                      >
                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                          {item.variantName && <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>}
                          <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm"
                              >−</button>
                              <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm"
                              >+</button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">₹{total().toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="block w-full py-3.5 bg-gray-900 text-white text-sm font-medium text-center rounded-full hover:bg-gray-800 transition-all hover:shadow-lg"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

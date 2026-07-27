import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'

function CartIcon() {
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()

  return (
    <button
      onClick={openCart}
      className="relative p-2.5 text-gray-700 hover:text-gray-900 transition-colors group"
      aria-label="Open cart"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl mt-4 px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold tracking-tight group">
              <span className="text-gray-900">Store</span><span className="text-brand-500">Pulse</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
              </Link>
              {isAuthenticated && (
                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                  Orders
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors relative group">
                  Admin
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <CartIcon />

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100/80 rounded-full hover:bg-gray-200/80 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/10"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

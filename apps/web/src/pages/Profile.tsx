import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function Profile() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view profile</h1>
        <Link to="/login" className="inline-flex items-center px-8 py-3.5 text-sm font-medium text-white bg-gray-900 rounded-full">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Account</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2">My Profile</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-10 bg-white border border-gray-100 rounded-2xl p-8">
        <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/20">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-full">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {[
            { to: '/orders', label: 'My Orders', desc: 'View order history', icon: '◈' },
            { to: '/wishlist', label: 'Wishlist', desc: 'Saved items', icon: '✦' },
            { to: '/profile', label: 'Addresses', desc: 'Manage addresses', icon: '●' },
            { to: '/profile', label: 'Settings', desc: 'Account settings', icon: '◉' },
          ].map((item) => (
            <Link key={item.label} to={item.to}
              className="group p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all card-hover">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

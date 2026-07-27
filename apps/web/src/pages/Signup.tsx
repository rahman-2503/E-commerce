import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await signup(email, name, password)
      navigate('/')
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running (npm run dev:api).')
      } else {
        setError(err.response?.data?.message || err.message || 'Signup failed')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-tight inline-block mb-8">
            <span className="text-gray-900">Store</span><span className="text-brand-500">Pulse</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2">Join StorePulse today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </motion.div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
              placeholder="Min. 6 characters" />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit"
            className="w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
            Create Account
          </motion.button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

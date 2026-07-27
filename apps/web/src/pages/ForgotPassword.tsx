import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-tight inline-block mb-8">
            <span className="text-gray-900">Store</span><span className="text-brand-500">Pulse</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
          <p className="text-gray-500 mt-2">Enter your email to receive instructions</p>
        </div>
        {sent ? (
          <div className="text-center p-8 bg-gray-50 rounded-2xl">
            <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">Check your email</p>
            <p className="text-sm text-gray-500">If an account exists, we've sent reset instructions to <strong>{email}</strong></p>
            <Link to="/login" className="mt-6 inline-block text-sm text-brand-600 font-semibold">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                placeholder="you@example.com" />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} type="submit"
              className="w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
              Send Reset Link
            </motion.button>
          </form>
        )}
        <p className="mt-8 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

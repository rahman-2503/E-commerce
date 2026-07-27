import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function AdminSettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setSaving(true)
    try {
      await api.post('/admin/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h2>
          <p className="text-sm text-gray-400 mb-6">Update your admin account password</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                placeholder="Confirm new password"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm font-medium ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Info</h2>
          <p className="text-sm text-gray-400 mb-6">Your admin account details</p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Account Type</p>
              <p className="text-sm font-medium text-gray-900">Administrator</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Password Strength</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-emerald-500 rounded-full" />
                </div>
                <span className="text-xs font-medium text-emerald-600">Strong</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">Security Tip</p>
                  <p className="text-xs text-amber-700 mt-1">Use a strong password with at least 8 characters, including numbers and special characters.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  isBlocked: boolean
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/users')
      .then(({ data }) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleBlock = async (id: string) => {
    try {
      await api.patch(`/users/${id}/block`)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to block user')
    }
  }

  const handleUnblock = async (id: string) => {
    try {
      await api.patch(`/users/${id}/unblock`)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to unblock user')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="p-4"><div className="h-4 w-48 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (
                users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.isBlocked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'ADMIN' && (
                          <>
                            {user.isBlocked ? (
                              <button
                                onClick={() => handleUnblock(user.id)}
                                className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(user.id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Block
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id, user.name || user.email)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {user.role === 'ADMIN' && (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
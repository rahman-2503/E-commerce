import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface CategoryForm {
  name: string
  slug: string
  description: string
}

const emptyForm: CategoryForm = { name: '', slug: '', description: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchCategories = () => {
    setLoading(true)
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (cat: any) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
    setEditingId(cat.id)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const data = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
      }
      if (editingId) {
        await api.patch(`/categories/${editingId}`, data)
      } else {
        await api.post('/categories', data)
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      console.error('Failed to save category:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category permanently?')) return
    try {
      await api.delete(`/categories/${id}`)
      setCategories(categories.filter((c) => c.id !== id))
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="p-4"><div className="h-4 w-36 bg-gray-100 rounded shimmer-bg" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded shimmer-bg" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-gray-100 rounded shimmer-bg" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-100 rounded shimmer-bg ml-auto" /></td>
                  </tr>
                ))
              ) : (
                categories.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-lg">{cat.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                          {cat.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{cat.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{cat._count?.products || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(cat)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    placeholder="Category name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    placeholder="category-slug" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none"
                    placeholder="Optional description" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

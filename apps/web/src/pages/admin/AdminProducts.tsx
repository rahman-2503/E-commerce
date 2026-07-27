import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface ProductForm {
  name: string
  slug: string
  description: string
  basePrice: string
  images: string
  categoryId: string
  isFeatured: boolean
  stock: string
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  basePrice: '',
  images: '',
  categoryId: '',
  isFeatured: false,
  stock: '10',
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=50'),
      api.get('/admin/categories'),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.items)
        setCategories(catRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (product: any) => {
    const totalStock = product.variants?.reduce((a: number, v: any) => a + v.stock, 0) || 0
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      basePrice: String(product.basePrice),
      images: product.images?.join('\n') || '',
      categoryId: product.categoryId || '',
      isFeatured: product.isFeatured || false,
      stock: String(totalStock),
    })
    setEditingId(product.id)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.basePrice) return
    setSaving(true)
    try {
      const stockVal = parseInt(form.stock) || 0
      if (editingId) {
        const { data: updated } = await api.patch(`/products/${editingId}`, {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
          description: form.description,
          basePrice: parseFloat(form.basePrice),
          images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
          categoryId: form.categoryId || null,
          isFeatured: form.isFeatured,
        })
        const firstVar = updated.variants?.[0]
        if (firstVar) {
          await api.patch(`/variants/${firstVar.id}`, { stock: stockVal })
        }
        setProducts(products.map(p => p.id === editingId ? { ...p, ...updated } : p))
      } else {
        const { data: created } = await api.post('/products', {
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
          description: form.description,
          basePrice: parseFloat(form.basePrice),
          images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
          categoryId: form.categoryId || null,
          isFeatured: form.isFeatured,
          variants: { create: [{ name: 'Default', sku: `SKU-${Date.now()}`, price: parseFloat(form.basePrice), stock: stockVal }] },
        })
        setProducts([created, ...products])
      }
      setShowModal(false)
    } catch (err) {
      console.error('Failed to save product:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const getStockTotal = (p: any) => p.variants?.reduce((a: number, v: any) => a + v.stock, 0) || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="p-4"><div className="h-4 w-48 bg-gray-100 rounded shimmer-bg" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-gray-100 rounded shimmer-bg" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-gray-100 rounded shimmer-bg" /></td>
                      <td className="p-4"><div className="h-4 w-12 bg-gray-100 rounded shimmer-bg" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded shimmer-bg ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  products.map((product, i) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        ₹{product.basePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          getStockTotal(product) > 0
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            getStockTotal(product) > 0 ? 'bg-brand-500' : 'bg-red-500'
                          }`} />
                          {getStockTotal(product)} units
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {product.rating} ★ ({product.reviewCount})
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    placeholder="product-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none"
                    placeholder="Product description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white"
                    >
                      <option value="">No category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                    <input
                      type="text"
                      value={form.images}
                      onChange={(e) => setForm({ ...form, images: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                      placeholder="url1, url2, ..."
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured product</span>
                </label>
              </div>
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.basePrice}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
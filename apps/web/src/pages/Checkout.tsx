import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import api from '@/lib/api'

const steps = [
  { num: 1, label: 'Address' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Payment' },
]

declare global {
  interface Window { Razorpay: any }
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState({ line1: '', city: '', state: '', zip: '', country: 'India' })
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponError('')
    try {
      const { data } = await api.post('/coupons/apply', { code: couponCode.trim(), amount: total() })
      setCouponDiscount(data.discount)
      setCouponError('')
    } catch (err: any) {
      setCouponDiscount(0)
      setCouponError(err.response?.data?.message || 'Invalid coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const discountedTotal = Math.max(0, total() - couponDiscount)

  const handlePayment = async () => {
    setProcessing(true)
    try {
      const { data: order } = await api.post('/payments/create-order', { amount: discountedTotal })
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'StorePulse',
        description: `Order of ${items.length} item(s)`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })
            await api.post('/orders', {
              items: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId || null,
                productName: i.name,
                unitPrice: i.price,
                quantity: i.quantity,
                variantName: i.variantName || null,
              })),
              subtotal: total(),
              discount: couponDiscount,
              total: discountedTotal,
              shippingAddress: address,
              couponCode: couponCode || null,
              paymentId: response.razorpay_payment_id,
            })
            try { await api.delete('/cart') } catch {}
            setShowSuccess(true)
            setTimeout(() => {
              clearCart()
              navigate('/orders')
            }, 2500)
          } catch (err: any) {
            console.error('Order creation failed:', err)
            setProcessing(false)
            const msg = err.response?.data?.message || err.message || 'Something went wrong'
            alert(`Payment captured but order failed: ${msg}. Contact support with payment ID: ${response.razorpay_payment_id}`)
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: () => setProcessing(false),
        },
        theme: { color: '#0a0a0a' },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error)
        setProcessing(false)
      })
      rzp.open()
    } catch (err) {
      console.error('Payment initiation failed:', err)
      setProcessing(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500">Redirecting to your orders...</p>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <button onClick={() => navigate('/products')} className="mt-6 px-8 py-3 text-sm font-medium text-white bg-gray-900 rounded-full">Continue Shopping</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-center gap-3 mb-16">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`flex items-center gap-2.5 ${i <= step ? 'text-gray-900' : 'text-gray-300'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= step ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400'
              }`}>{s.num}</div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-16 h-0.5 ${i < step ? 'bg-gray-900' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Shipping Address</h2>
              <div className="space-y-4">
                <input placeholder="Address Line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  <input placeholder="ZIP Code" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  <input value={address.country} disabled
                    className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Review Order</h2>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between py-3 border-b border-gray-200/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Coupon Code</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(0); setCouponError('') }}
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-sm text-emerald-600 font-medium mt-2">Discount: -₹{couponDiscount.toLocaleString('en-IN')}</p>
                )}
                {couponError && (
                  <p className="text-sm text-red-500 mt-2">{couponError}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">₹{total().toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-emerald-600 font-medium">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{discountedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Secure Payment</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                You'll be redirected to Razorpay's secure checkout to complete payment of <strong className="text-gray-900">₹{discountedTotal.toLocaleString('en-IN')}</strong>
              </p>
              {couponCode && couponDiscount > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-2">Coupon {couponCode} applied</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-12">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
          className="px-8 py-3.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-all">
          Back
        </button>
        <button onClick={step === 2 ? handlePayment : () => setStep(step + 1)}
          disabled={processing || (step === 0 && (!address.line1 || !address.city || !address.state || !address.zip))}
          className="px-10 py-3.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {processing ? 'Processing...' : step === 2 ? `Pay ₹${discountedTotal.toLocaleString('en-IN')}` : 'Continue'}
        </button>
      </div>
    </div>
  )
}
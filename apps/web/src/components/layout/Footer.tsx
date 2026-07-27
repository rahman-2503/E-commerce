import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold tracking-tight">
              <span className="text-white">Store</span><span className="text-brand-500">Pulse</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Premium e-commerce platform delivering curated products from top brands worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-3">
              {['All Products', 'Categories', 'New Arrivals', 'Sale'].map((item) => (
                <li key={item}><Link to="/products" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-3">
              {['Contact Us', 'FAQs', 'Shipping Info', 'Returns'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-3">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">&copy; 2026 StorePulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Twitter', 'Instagram', 'YouTube'].map((social) => (
              <a key={social} href="#" className="text-sm text-gray-600 hover:text-white transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

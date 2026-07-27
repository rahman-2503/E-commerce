import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero3D from '@/components/product/Hero3D'
import ProductCard from '@/components/product/ProductCard'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MagneticButton from '@/components/ui/MagneticButton'
import ParallaxSection from '@/components/ui/ParallaxSection'
import api from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

const categoryColors = [
  'from-emerald-500/20 to-emerald-600/10',
  'from-blue-500/20 to-blue-600/10',
  'from-amber-500/20 to-amber-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-violet-500/20 to-violet-600/10',
  'from-cyan-500/20 to-cyan-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-indigo-500/20 to-indigo-600/10',
  'from-teal-500/20 to-teal-600/10',
  'from-orange-500/20 to-orange-600/10',
]

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 100])

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/30 via-white to-white pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div style={{ y }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-full mb-8 border border-brand-100">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                New Collection 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
            >
              <span className="text-gray-900">Premium</span>
              <br />
              <span className="gradient-text">Products</span>
              <br />
              <span className="text-gray-900">Delivered</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-lg text-gray-500 max-w-lg leading-relaxed"
            >
              Discover curated products from the world's best brands. 
              Experience seamless shopping with lightning-fast delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex items-center gap-4"
            >
              <MagneticButton>
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-3.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-black/10"
                >
                  Shop Now
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-3.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:shadow-lg"
                >
                  Explore
                </Link>
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100/20 to-transparent rounded-3xl" />
            <Hero3D />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </motion.section>
  )
}

function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '10K+', label: 'Products' },
            { value: '99%', label: 'Satisfaction' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="stat-item text-center">
              <p className="text-4xl sm:text-5xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-2 text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedSection({ products }: { products: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.featured-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Curated Selection</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-4 leading-tight">
                Featured
                <br />
                <span className="text-gray-400">Products</span>
              </h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all shadow-sm">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product: any, i: number) => (
            <div key={product.id} className="featured-card">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        <ScrollReveal className="text-center mt-12 sm:hidden">
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-full">
            View All Products
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

function CategorySection({ categories }: { categories: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.category-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Collections</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-4">
              Shop by <span className="gradient-text">Category</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">
              Browse our curated collections
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.slug} className="category-item">
              <Link
                to={`/products?category=${cat.slug}`}
                className="group block relative overflow-hidden rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-500 card-hover"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[i % categoryColors.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-8 h-8 bg-brand-500/20 rounded-lg" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{cat._count?.products || 0} items</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-400 tracking-[0.2em] uppercase">Why Choose Us</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4">
              Built for <span className="text-brand-400">Excellence</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '✦', title: 'Premium Quality', desc: 'Every product is handpicked and verified for the highest quality standards.' },
            { icon: '◈', title: 'Secure Checkout', desc: 'Bank-grade encryption for all transactions. Your data stays safe.' },
            { icon: '❖', title: 'Swift Delivery', desc: 'Free shipping on orders above ₹999. Track your order in real-time.' },
          ].map((feature, i) => (
            <div key={feature.title} className="feature-item group relative p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-500">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl text-brand-400">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setFeaturedProducts(data))
      .catch(() => {})
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  return (
    <div>
      <HeroSection />
      <StatsSection />
      {featuredProducts.length > 0 && <FeaturedSection products={featuredProducts} />}
      {categories.length > 0 && <CategorySection categories={categories} />}
      <ParallaxSection speed={0.3}>
        <FeaturesSection />
      </ParallaxSection>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <span className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Ready to Shop?</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-4 leading-tight">
              Start Your Shopping
              <br />
              <span className="text-gray-400">Journey Today</span>
            </h2>
            <p className="mt-6 text-gray-500 max-w-lg mx-auto">
              Join thousands of happy customers who trust StorePulse for their premium shopping experience.
            </p>
            <div className="mt-10">
              <MagneticButton>
                <Link
                  to="/products"
                  className="inline-flex items-center px-10 py-4 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-black/10"
                >
                  Browse Products
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

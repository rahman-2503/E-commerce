import { useRef, useState } from 'react'

interface Hover3DCardProps {
  children: React.ReactNode
  className?: string
}

export default function Hover3DCard({ children, className = '' }: Hover3DCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setRotate({ x: (y - 0.5) * -10, y: (x - 0.5) * 10 })
    setGlow({ x: x * 100, y: y * 100 })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setGlow({ x: 50, y: 50 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(34, 197, 94, 0.08), transparent 60%)`,
          }}
        />
      </div>
    </div>
  )
}

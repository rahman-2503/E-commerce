import { useRef, useState } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  href?: string
  onClick?: () => void
}

export default function MagneticButton({ children, className = '', as = 'button', href, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  const Tag = as

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className="inline-block"
    >
      <Tag
        href={href}
        onClick={onClick}
        className={className}
      >
        {children}
      </Tag>
    </div>
  )
}

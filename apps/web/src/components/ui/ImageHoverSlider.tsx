import { useState, useRef, useEffect } from 'react'

interface ImageHoverSliderProps {
  images: string[]
  className?: string
}

export default function ImageHoverSlider({ images, className = '' }: ImageHoverSliderProps) {
  const [hovered, setHovered] = useState(false)
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]))
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleMouseEnter = () => {
    setHovered(true)
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((prev) => {
          const next = (prev + 1) % images.length
          setLoaded((prevLoaded) => new Set([...prevLoaded, next]))
          return next
        })
      }, 800)
    }
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setIndex(0)
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loaded.has(index) ? (
        <img
          src={images[index]}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700"
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.slice(0, 4).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-4' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

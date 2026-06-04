import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

const X_PATH =
  'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z'

export function XHoverLogo() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' })

  useEffect(() => {
    if (!hovered) return
    const handleMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      setMaskPosition({
        cx: `${((e.clientX - rect.left) / rect.width) * 100}%`,
        cy: `${((e.clientY - rect.top) / rect.height) * 100}%`,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [hovered])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        {/* Neutral silver/gray gradient — visible on hover following cursor */}
        <linearGradient id="xLogoGradient" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#d4d4d4" />
          <stop offset="30%"  stopColor="#737373" />
          <stop offset="60%"  stopColor="#a3a3a3" />
          <stop offset="100%" stopColor="#525252" />
        </linearGradient>

        <motion.radialGradient
          id="xRevealMask"
          gradientUnits="userSpaceOnUse"
          r="55%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration: 0, ease: 'easeOut' }}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="xTextMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#xRevealMask)" />
        </mask>
      </defs>

      {/* Base outline — always faintly visible */}
      <path
        d={X_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.25"
        className="text-neutral-700 dark:text-neutral-600"
        style={{ opacity: hovered ? 0.6 : 0.25, transition: 'opacity 0.3s' }}
      />

      {/* Draw-on animation stroke */}
      <motion.path
        d={X_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.25"
        className="text-neutral-400 dark:text-neutral-500"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />

      {/* Silver gradient reveal that follows cursor on hover */}
      <path
        d={X_PATH}
        fill="none"
        stroke="url(#xLogoGradient)"
        strokeWidth="0.4"
        mask="url(#xTextMask)"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}
      />

      {/* Dark fill — gives the X its solid body */}
      <path
        d={X_PATH}
        className="fill-current opacity-10"
      />
    </svg>
  )
}

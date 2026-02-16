'use client'
import { RARITY_CONFIG, type Peon, type Rarity } from '@/lib/mock-data'

// SVG frame decorations per rarity
function RarityFrame({ rarity, size = 'md' }: { rarity: Rarity, size?: 'sm' | 'md' | 'lg' }) {
  const config = RARITY_CONFIG[rarity]
  const dims = size === 'sm' ? 48 : size === 'md' ? 72 : 96
  const pad = size === 'sm' ? 3 : 4

  return (
    <div
      className={`relative flex items-center justify-center ${
        rarity === 'mythic' ? 'animate-mythic-pulse' : ''
      }`}
      style={{ width: dims, height: dims }}
    >
      {/* Outer glow */}
      {rarity !== 'common' && (
        <div
          className="absolute inset-0 rounded-lg opacity-60"
          style={{ boxShadow: config.frameGlow }}
        />
      )}

      {/* Frame border */}
      <div
        className={`absolute inset-0 rounded-lg ${
          rarity === 'mythic' ? 'border-[3px]' : rarity === 'legendary' ? 'border-[3px]' : 'border-2'
        }`}
        style={{
          borderColor: config.color,
          background: config.frameBg,
        }}
      />

      {/* Corner accents for epic+ */}
      {(['epic', 'legendary', 'mythic'] as Rarity[]).includes(rarity) && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: config.color }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: config.color }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: config.color }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: config.color }} />
        </>
      )}

      {/* Particle effects for mythic */}
      {rarity === 'mythic' && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-float-particle"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 4px ${config.color}`,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Inner shine for legendary */}
      {rarity === 'legendary' && (
        <div
          className="absolute inset-1 rounded opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent 70%)` }}
        />
      )}
    </div>
  )
}

export default function PeonPortrait({
  peon,
  size = 'md',
  showName = true,
  showPower = true,
  className = '',
}: {
  peon: Peon
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showPower?: boolean
  className?: string
}) {
  const config = RARITY_CONFIG[peon.rarity]
  const dims = size === 'sm' ? 48 : size === 'md' ? 72 : 96
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
  const nameSize = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: dims, height: dims }}>
        <RarityFrame rarity={peon.rarity} size={size} />
        {/* Icon / portrait */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold z-10`}
          style={{ color: config.color, textShadow: config.glow !== 'none' ? config.glow : `0 0 5px ${config.color}40` }}
        >
          {peon.icon || peon.image}
        </div>
      </div>
      {showName && (
        <div className={`${nameSize} font-bold text-center truncate max-w-[80px]`} style={{ color: config.color }}>
          {peon.name}
        </div>
      )}
      {showPower && (
        <div className={`${size === 'sm' ? 'text-[9px]' : 'text-[10px]'} text-amber-400/60`}>
          ×{peon.miningPower}
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Navigation from '@/components/Navigation'
import PeonPortrait from '@/components/PeonPortrait'
import { Button } from '@/components/ui/warcraftcn/button'
import { Card, CardContent } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { openPack } from '@/lib/game-store'
import { RARITY_CONFIG, type Peon, type Rarity } from '@/lib/mock-data'
import { useSound } from '@/lib/sound-context'
import { useToast } from '@/lib/toast-context'
import { useWallet } from '@solana/wallet-adapter-react'

type Phase = 'idle' | 'shaking' | 'burst' | 'revealing' | 'summary'

function TreasureChest({ phase, shakeIntensity }: { phase: Phase, shakeIntensity: number }) {
  return (
    <div className={`relative inline-block ${phase === 'shaking' ? '' : ''}`}>
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-300 ${
          phase === 'idle' ? 'bg-amber-600/20 scale-100' : phase === 'shaking' ? 'bg-amber-500/40' : 'bg-amber-400/60 scale-150'
        }`}
        style={phase === 'shaking' ? { transform: `scale(${1 + shakeIntensity * 0.5})` } : {}}
      />
      <div
        className={`relative w-32 h-28 md:w-40 md:h-36 ${phase === 'shaking' ? 'animate-chest-shake' : ''} ${phase === 'burst' ? 'animate-chest-burst' : ''}`}
        style={phase === 'shaking' ? { '--shake-intensity': shakeIntensity } as React.CSSProperties : {}}
      >
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <rect x="10" y="45" width="100" height="50" rx="5" fill="#6B3410" stroke="#3D1E08" strokeWidth="2" />
          <rect x="10" y="45" width="100" height="50" rx="5" fill="url(#chest-wood)" />
          <rect x="8" y="55" width="104" height="6" rx="2" fill="#8B7355" stroke="#5C4D36" strokeWidth="1" />
          <rect x="8" y="75" width="104" height="6" rx="2" fill="#8B7355" stroke="#5C4D36" strokeWidth="1" />
          <path d="M10 48 Q60 10 110 48" fill="#7B4420" stroke="#3D1E08" strokeWidth="2" />
          <path d="M10 48 Q60 15 110 48" fill="url(#chest-lid)" />
          <circle cx="60" cy="55" r="8" fill="#C9A84C" stroke="#8B7633" strokeWidth="2" />
          <rect x="56" y="53" width="8" height="6" rx="1" fill="#3D1E08" />
          <ellipse cx="40" cy="35" rx="15" ry="3" fill="white" opacity="0.1" />
          <defs>
            <linearGradient id="chest-wood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5A2B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3D1E08" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="chest-lid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9B6A3A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5B3A1A" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {phase === 'shaking' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-shake-particle"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                top: `${50 + (Math.random() - 0.5) * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LightBeams({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 animate-light-beam"
          style={{
            height: '200vh',
            background: `linear-gradient(to bottom, transparent, ${color}40, transparent)`,
            transform: `rotate(${i * 30}deg)`,
            transformOrigin: 'center center',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

function CardReveal({ peon, index, onDone }: { peon: Peon, index: number, onDone: () => void }) {
  const [flipped, setFlipped] = useState(false)
  const [impact, setImpact] = useState(false)
  const config = RARITY_CONFIG[peon.rarity]
  const isHighRarity = ['epic', 'legendary', 'mythic'].includes(peon.rarity)

  useEffect(() => {
    const delay = index * 800
    const timer = setTimeout(() => {
      setFlipped(true)
      setTimeout(() => {
        setImpact(true)
        setTimeout(onDone, 200)
      }, 400)
    }, delay)
    return () => clearTimeout(timer)
  }, [index, onDone])

  return (
    <div className="perspective-1000 w-full">
      <div className={`relative transition-all duration-500 ${flipped ? '' : 'rotate-y-180'}`} style={{ transformStyle: 'preserve-3d' }}>
        <div
          className={`absolute inset-0 rounded-xl border-2 border-amber-700 bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center backface-hidden rotate-y-180 ${
            !flipped ? 'z-10' : 'z-0'
          }`}
          style={{ minHeight: 200, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl text-amber-600/40">?</div>
        </div>
        <div
          className={`relative rounded-xl border-2 p-4 md:p-6 text-center bg-gradient-to-b ${config.bg} overflow-hidden transition-all ${
            impact ? 'scale-100' : 'scale-95'
          } ${impact && isHighRarity ? 'animate-card-impact' : ''}`}
          style={{
            borderColor: config.color,
            boxShadow: config.glow !== 'none' ? config.glow : undefined,
            minHeight: 200,
          }}
        >
          {isHighRarity && (
            <div
              className="absolute inset-0 animate-pulse opacity-20"
              style={{ background: `radial-gradient(circle, ${config.color}, transparent 70%)` }}
            />
          )}
          {flipped && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(peon.rarity === 'mythic' ? 30 : peon.rarity === 'legendary' ? 20 : 10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full animate-reveal-particle"
                  style={{
                    backgroundColor: config.color,
                    left: `${50 + (Math.random() - 0.5) * 80}%`,
                    top: `${50 + (Math.random() - 0.5) * 80}%`,
                    boxShadow: `0 0 6px ${config.color}`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random() * 1.5}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative z-10">
            <PeonPortrait peon={peon} size="lg" />
            <Badge size="sm" className="mt-2" style={{ borderColor: config.color, color: config.color }}>
              {peon.rarity.toUpperCase()}
            </Badge>
            <div className="text-amber-400/70 text-sm mt-1">
              Mining Power: <span className="text-amber-200 font-bold">×{peon.miningPower}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PacksPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [results, setResults] = useState<Peon[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const [opening, setOpening] = useState(false)
  const shakeRef = useRef<NodeJS.Timeout>()
  const { play } = useSound()
  const { toast } = useToast()
  const { publicKey } = useWallet()

  const bestRarity = results.length > 0
    ? (['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'] as Rarity[]).find(r => results.some(p => p.rarity === r)) || 'common'
    : 'common'

  const handleOpenPack = useCallback(async () => {
    if (!publicKey || opening) return
    setPhase('shaking')
    setRevealedCount(0)
    setShakeIntensity(0)
    setOpening(true)
    play('pack_shake')

    let intensity = 0
    const shakeInterval = setInterval(() => {
      intensity += 0.05
      setShakeIntensity(Math.min(intensity, 1))
    }, 100)

    try {
      const peons = await openPack(publicKey.toBase58())
      clearInterval(shakeInterval)
      setResults(peons)
      play('pack_open')
      setPhase('burst')
      setTimeout(() => setPhase('revealing'), 800)
    } catch (err) {
      clearInterval(shakeInterval)
      toast('Failed to open pack', 'info')
      setPhase('idle')
    } finally {
      setOpening(false)
    }

    shakeRef.current = shakeInterval
  }, [play, publicKey, opening, toast])

  const handleCardRevealed = useCallback(() => {
    setRevealedCount(prev => {
      const next = prev + 1
      if (next >= 3) {
        setTimeout(() => setPhase('summary'), 600)
      }
      return next
    })
  }, [])

  const handleSkip = useCallback(() => {
    setRevealedCount(3)
    setPhase('summary')
  }, [])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setResults([])
    setRevealedCount(0)
  }, [])

  const showDarkOverlay = phase === 'burst' && ['legendary', 'mythic'].includes(bestRarity)
  const showScreenShake = phase === 'burst' && bestRarity === 'mythic'

  return (
    <div className={`min-h-screen pb-24 md:pt-16 ${showScreenShake ? 'animate-screen-shake' : ''}`}>
      <Navigation />
      {showDarkOverlay && (
        <div className="fixed inset-0 bg-black/80 z-20 animate-fade-in" style={{ animationDuration: '0.3s' }} />
      )}
      {phase === 'burst' && <LightBeams color={RARITY_CONFIG[bestRarity].color} />}
      {phase === 'burst' && ['epic', 'legendary', 'mythic'].includes(bestRarity) && (
        <div className="fixed inset-0 pointer-events-none z-40 animate-flash" style={{ backgroundColor: RARITY_CONFIG[bestRarity].color }} />
      )}
      {phase === 'burst' && bestRarity === 'mythic' && (
        <div className="fixed inset-0 z-35 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/30 via-transparent to-transparent animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold rounded-full animate-mythic-burst"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${0.5 + Math.random()}s`,
                '--burst-x': `${(Math.random() - 0.5) * 200}vw`,
                '--burst-y': `${(Math.random() - 0.5) * 200}vh`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 py-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-2">War Packs</h1>
          <p className="text-amber-500/60 text-sm">Each pack contains 3 peons of random rarity. May the loot gods favor you!</p>
        </div>
        {phase === 'idle' && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="mb-6"><TreasureChest phase={phase} shakeIntensity={0} /></div>
            <Button variant="frame" onClick={handleOpenPack} disabled={opening} className="text-lg px-8 py-4 text-amber-100 hover:scale-[1.03] transition-transform">
              🎰 Open Pack (100 $GOLD)
            </Button>
            <p className="text-amber-900/50 text-xs mt-2">Opens 1 pack • 3 Peons inside</p>
          </div>
        )}
        {phase === 'shaking' && (
          <div className="text-center mb-8">
            <TreasureChest phase={phase} shakeIntensity={shakeIntensity} />
            <p className="text-amber-400 animate-pulse mt-6 text-lg">Opening...</p>
          </div>
        )}
        {phase === 'burst' && (
          <div className="text-center mb-8 relative z-50">
            <TreasureChest phase={phase} shakeIntensity={1} />
          </div>
        )}
        {phase === 'revealing' && (
          <div className="relative z-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {results.map((peon, i) => (
                <CardReveal key={peon.id} peon={peon} index={i} onDone={handleCardRevealed} />
              ))}
            </div>
            <div className="text-center">
              <button onClick={handleSkip} className="text-amber-500/40 text-xs hover:text-amber-400 transition-colors">Skip →</button>
            </div>
          </div>
        )}
        {phase === 'summary' && (
          <div className="animate-fade-in relative z-50">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-amber-300 mb-1">Pack Results</h2>
              <p className="text-amber-500/50 text-xs">Best pull: <span style={{ color: RARITY_CONFIG[bestRarity].color }}>{bestRarity.toUpperCase()}</span></p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {results.map(peon => {
                const config = RARITY_CONFIG[peon.rarity]
                return (
                  <div key={peon.id} className={`rounded-xl border-2 p-4 text-center bg-gradient-to-b ${config.bg}`} style={{ borderColor: config.color, boxShadow: config.glow !== 'none' ? config.glow : undefined }}>
                    <PeonPortrait peon={peon} size="md" />
                    <Badge size="sm" className="mt-1" style={{ borderColor: config.color, color: config.color }}>{peon.rarity.toUpperCase()}</Badge>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="frame" onClick={handleOpenPack} disabled={opening} className="text-amber-100 hover:scale-[1.02] transition-transform">🎰 Open Another</Button>
              <Button variant="default" onClick={handleReset} className="text-amber-100">Done</Button>
            </div>
          </div>
        )}
        <Card className="mt-8">
          <CardContent className="py-6">
            <h2 className="text-lg font-bold text-amber-300 mb-4 text-center">Pack Shop</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Single Pack', count: 1, price: 100, bonus: '' },
                { name: 'Bundle (5)', count: 5, price: 450, bonus: '10% OFF' },
                { name: 'Mega Bundle (10)', count: 10, price: 800, bonus: '20% OFF' },
              ].map(pack => (
                <div key={pack.name} className="border border-amber-900/30 rounded-lg p-4 text-center bg-black/20 hover:bg-amber-900/10 hover:border-amber-700/50 transition-all cursor-pointer">
                  <div className="text-3xl mb-2">📦{pack.count > 1 ? `×${pack.count}` : ''}</div>
                  <div className="text-amber-200 font-bold">{pack.name}</div>
                  <div className="text-gold font-bold">{pack.price} $GOLD</div>
                  {pack.bonus && <Badge size="sm" variant="destructive" className="mt-1">{pack.bonus}</Badge>}
                  <Button variant="default" className="mt-3 w-full text-sm text-amber-100 hover:scale-[1.02] transition-transform">Buy</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <p className="text-amber-900/50 text-xs mb-2">Drop Rates</p>
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG[Rarity]][]).map(([rarity, config]) => (
              <span key={rarity} className="text-xs" style={{ color: config.color }}>{rarity}: {(config.chance * 100).toFixed(1)}%</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

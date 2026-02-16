'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/warcraftcn/button'
import { Input } from '@/components/ui/warcraftcn/input'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

function TypingText({ text, speed = 50 }: { text: string, speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-amber-400">|</span>}
    </span>
  )
}

function AnimatedCounter({ target, duration = 2000 }: { target: number, duration?: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.floor(target * progress))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>{value.toLocaleString()}</>
}

// Animated pickaxe SVG
function PickaxeIcon() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full animate-pickaxe-swing" style={{ transformOrigin: '70% 70%' }}>
        {/* Handle */}
        <line x1="30" y1="30" x2="75" y2="75" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
        {/* Pickaxe head */}
        <path d="M15 25 Q20 15 30 20 L35 35 Q25 30 15 25Z" fill="#9d9d9d" stroke="#666" strokeWidth="1" />
        <path d="M20 20 Q25 12 33 18" fill="none" stroke="#bbb" strokeWidth="1" opacity="0.5" />
        {/* Sparkles */}
        <circle cx="18" cy="18" r="2" fill="#FFD700" className="animate-sparkle" opacity="0" />
        <circle cx="25" cy="12" r="1.5" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.3s' }} opacity="0" />
        <circle cx="12" cy="22" r="1" fill="#FFD700" className="animate-sparkle" style={{ animationDelay: '0.6s' }} opacity="0" />
      </svg>
      {/* Gold particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-gold rounded-full animate-gold-float"
          style={{
            left: `${20 + Math.random() * 30}%`,
            bottom: '30%',
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [entered, setEntered] = useState(false)
  const [codeValid, setCodeValid] = useState<boolean | null>(null)
  const router = useRouter()
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInviteCode(val)
    if (val.length >= 3) {
      setCodeValid(true) // any code works
    } else {
      setCodeValid(null)
    }
  }

  const handleEnter = () => {
    if (!connected) {
      setVisible(true)
      return
    }
    setEntered(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  // Auto-enter when wallet connects
  useEffect(() => {
    if (connected && codeValid) {
      setEntered(true)
      setTimeout(() => router.push('/dashboard'), 800)
    }
  }, [connected])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient effects */}
      <div className="ambient-glow" />
      
      {/* Parallax floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Logo + content */}
      <div className={`transition-all duration-700 ${entered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
        <PickaxeIcon />

        <h1 className="text-4xl md:text-6xl font-bold text-center gold-glow mb-2">
          <span className="text-amber-300">Peon&apos;s</span>{' '}
          <span className="text-gold">Gold</span>
        </h1>
        <div className="text-amber-100/60 text-center text-sm md:text-base mb-8 max-w-md mx-auto">
          <TypingText text="Work complete! Mine gold, open packs, build your empire." speed={40} />
          <br />
          <span className="text-amber-500/80">A Solana idle mining game.</span>
        </div>

        {/* Invite code */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
          <div className="w-full relative">
            <label className="text-amber-400/70 text-xs uppercase tracking-wider mb-1 block text-center">
              Invite Code
            </label>
            <Input
              placeholder="Enter invite code..."
              value={inviteCode}
              onChange={handleCodeChange}
              className="w-full text-center text-amber-200 placeholder:text-amber-900/50"
            />
            {codeValid !== null && (
              <div className={`absolute right-3 top-[50%] text-lg ${codeValid ? 'text-green-400' : 'text-red-400'}`}>
                {codeValid ? '✓' : '✗'}
              </div>
            )}
          </div>
          {connected ? (
            <Button
              variant="frame"
              className="w-full text-lg py-5 text-amber-100 hover:scale-[1.02] transition-transform"
              onClick={handleEnter}
            >
              ⚔️ Enter the Mines
            </Button>
          ) : (
            <Button
              variant="frame"
              className="w-full text-lg py-5 text-amber-100 hover:scale-[1.02] transition-transform"
              onClick={() => setVisible(true)}
            >
              👛 Connect Wallet & Enter
            </Button>
          )}
          {connected && publicKey && (
            <p className="text-green-400/70 text-xs text-center">
              ✓ {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)} connected
            </p>
          )}
          <p className="text-amber-900/60 text-xs text-center">
            {connected ? 'No invite code? Ask a fellow peon for one.' : 'Connect Phantom or Solflare to enter.'}
          </p>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-8 text-center">
        <div className="flex items-center gap-6 text-amber-500/60 text-xs mb-2">
          <span><AnimatedCounter target={1247} /> miners</span>
          <span className="text-amber-900/40">•</span>
          <span><AnimatedCounter target={2400000} />+ $GOLD mined</span>
        </div>
        <div className="text-amber-900/40 text-xs">
          Built on Solana • Powered by $GOLD • Lok&apos;tar Ogar
        </div>
      </div>
    </div>
  )
}

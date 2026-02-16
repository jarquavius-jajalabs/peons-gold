'use client'
import { useState, useEffect } from 'react'

export default function ClaimTimer({ lastClaimTime, unclaimedGold }: { lastClaimTime: number, unclaimedGold: number }) {
  const [now, setNow] = useState(Date.now())
  const EPOCH = 15 * 60 * 1000

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  const elapsed = now - lastClaimTime
  const epochsPassed = Math.floor(elapsed / EPOCH)
  const nextEpochIn = EPOCH - (elapsed % EPOCH)
  const mins = Math.floor(nextEpochIn / 60000)
  const secs = Math.floor((nextEpochIn % 60000) / 1000)
  const progress = ((elapsed % EPOCH) / EPOCH) * 100

  return (
    <div className="text-center">
      <div className="text-amber-400/70 text-xs uppercase tracking-wider mb-1">Next Epoch</div>
      <div className="text-2xl font-bold text-amber-300 gold-glow tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      {/* Progress bar */}
      <div className="w-full max-w-xs mx-auto h-1.5 bg-amber-900/30 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-gold rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-amber-500/60 text-xs mt-1">{epochsPassed} epochs since last claim</div>
      <div className={`mt-2 text-lg font-bold ${unclaimedGold > 0 ? 'text-gold animate-pulse' : 'text-amber-500/40'}`}>
        +{unclaimedGold.toFixed(1)} $GOLD pending
      </div>
    </div>
  )
}

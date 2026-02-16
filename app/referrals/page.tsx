'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/warcraftcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { Input } from '@/components/ui/warcraftcn/input'
import { getState } from '@/lib/game-store'
import type { PlayerState } from '@/lib/mock-data'
import { useToast } from '@/lib/toast-context'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ReferralsPage() {
  const [state, setState] = useState<PlayerState | null>(null)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { publicKey, connected } = useWallet()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && connected && publicKey) {
      setLoading(true)
      getState(publicKey.toBase58()).then(s => {
        setState(s)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [mounted, connected, publicKey])

  if (!mounted) return <div className="min-h-screen" />

  if (loading || !state) {
    return (
      <div className="min-h-screen pb-24 md:pt-16">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-amber-400 animate-pulse text-lg">⛏️ Loading referrals...</div>
        </div>
      </div>
    )
  }

  const totalEarnings = state.referrals.reduce((s, r) => s + r.earnings, 0)
  const tier1 = state.referrals.filter(r => r.tier === 1)
  const tier2 = state.referrals.filter(r => r.tier === 2)

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://peonsgold.com?ref=${state.inviteCode}`)
    setCopied(true)
    toast('Invite link copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-2">📜 Referral Program</h1>
          <p className="text-amber-500/60 text-sm">Invite fellow peons. Earn from their mines forever.</p>
        </div>
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <p className="text-amber-400/70 text-xs uppercase tracking-wider mb-2">Your Invite Code</p>
            <div className="text-3xl font-bold text-gold gold-glow mb-3">{state.inviteCode}</div>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <Input value={`https://peonsgold.com?ref=${state.inviteCode}`} readOnly className="text-xs text-amber-400/60" />
              <Button variant="default" onClick={handleCopy} className="text-sm text-amber-100 whitespace-nowrap hover:scale-[1.02] transition-transform">
                {copied ? '✓ Copied' : '📋 Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Earned', value: `${totalEarnings.toFixed(1)} $GOLD`, icon: '💰' },
            { label: 'Tier 1 (5%)', value: `${tier1.length} refs`, icon: '⭐' },
            { label: 'Tier 2 (2.5%)', value: `${tier2.length} refs`, icon: '✨' },
          ].map(stat => (
            <Card key={stat.label} data-size="sm">
              <CardContent className="py-3 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-gold font-bold text-sm">{stat.value}</div>
                <div className="text-amber-500/50 text-[10px]">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Your Referrals</CardTitle></CardHeader>
          <CardContent>
            {state.referrals.length === 0 ? (
              <p className="text-amber-500/50 text-sm text-center py-4">No referrals yet. Share your code!</p>
            ) : (
              <div className="space-y-3">
                {state.referrals.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-amber-900/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <div className="text-amber-200 text-sm font-mono">{ref.address}</div>
                        <div className="text-amber-500/50 text-xs">{Math.floor((Date.now() - ref.joinedAt) / 86400000)}d ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-bold text-sm">{ref.earnings.toFixed(1)} $GOLD</div>
                      <Badge size="sm">Tier {ref.tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-amber-900/50 text-xs space-y-1">
          <p>Tier 1: Earn 5% of your direct referral&apos;s $GOLD claims</p>
          <p>Tier 2: Earn 2.5% of their referrals&apos; claims</p>
          <p>Rewards are automatic and forever</p>
        </div>
      </div>
    </div>
  )
}

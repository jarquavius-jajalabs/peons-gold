'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { getState } from '@/lib/game-store'
import type { PlayerState } from '@/lib/mock-data'
import { useWallet } from '@solana/wallet-adapter-react'

function BarChart({ data, maxValue }: { data: { label: string, value: number, color: string }[], maxValue: number }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] text-amber-400/60">{(d.value / 1000).toFixed(0)}K</div>
          <div className="w-full rounded-t relative overflow-hidden" style={{
            height: `${(d.value / maxValue) * 100}%`,
            backgroundColor: d.color + '30',
            minHeight: 4,
          }}>
            <div className="absolute inset-0 opacity-60" style={{ backgroundColor: d.color }} />
          </div>
          <div className="text-[9px] text-amber-500/50">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function StatBox({ label, value, sub, color = 'text-gold' }: { label: string, value: string, sub?: string, color?: string }) {
  return (
    <div className="text-center p-3 rounded-lg border border-amber-900/20 bg-black/20">
      <div className="text-amber-500/50 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {sub && <div className="text-amber-500/40 text-[10px] mt-0.5">{sub}</div>}
    </div>
  )
}

export default function EconomyPage() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PlayerState | null>(null)
  const [loading, setLoading] = useState(true)
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
          <div className="text-amber-400 animate-pulse text-lg">⛏️ Loading economy...</div>
        </div>
      </div>
    )
  }

  const totalMiningPower = state.peons.reduce((s, p) => s + (p.assignedMineId ? p.miningPower : 0), 0)
  const epochsPerDay = 96
  const dailyEarning = totalMiningPower * epochsPerDay

  const burnData = [
    { label: 'Mon', value: 45000, color: '#ff8000' },
    { label: 'Tue', value: 52000, color: '#ff8000' },
    { label: 'Wed', value: 38000, color: '#ff8000' },
    { label: 'Thu', value: 61000, color: '#ff8000' },
    { label: 'Fri', value: 55000, color: '#ff8000' },
    { label: 'Sat', value: 72000, color: '#ff8000' },
    { label: 'Sun', value: 48000, color: '#ff8000' },
  ]

  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-2">📊 $GOLD Economy</h1>
          <p className="text-amber-500/60 text-sm">Token supply, burn rates, and emissions</p>
        </div>
        <Card className="mb-6">
          <CardHeader><CardTitle>Token Supply</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Total Minted" value="10.0M" sub="$GOLD" />
              <StatBox label="Burned" value="2.4M" sub="24% of supply" color="text-orange-400" />
              <StatBox label="Circulating" value="7.6M" sub="76% of supply" color="text-green-400" />
            </div>
            <div className="mt-4 h-3 bg-amber-900/20 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-600/60" style={{ width: '76%' }} />
              <div className="h-full bg-orange-600/60" style={{ width: '24%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-amber-500/40 mt-1">
              <span>Circulating: 76%</span>
              <span>Burned: 24%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><CardTitle>Weekly Burn Rate</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={burnData} maxValue={80000} />
            <div className="text-center mt-3">
              <span className="text-amber-500/50 text-xs">Avg: </span>
              <span className="text-orange-400 text-sm font-bold">~53K $GOLD/day</span>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><CardTitle>Emission Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { phase: 'Phase 1 (Current)', rate: '100K/day', period: 'Month 1-3', active: true },
                { phase: 'Phase 2', rate: '75K/day', period: 'Month 4-6', active: false },
                { phase: 'Phase 3', rate: '50K/day', period: 'Month 7-12', active: false },
                { phase: 'Phase 4', rate: '25K/day', period: 'Year 2+', active: false },
              ].map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded ${p.active ? 'bg-amber-900/20 border border-amber-600/30' : ''}`}>
                  <div>
                    <div className={`text-sm ${p.active ? 'text-amber-200' : 'text-amber-500/50'}`}>{p.phase}</div>
                    <div className="text-[10px] text-amber-500/40">{p.period}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${p.active ? 'text-gold' : 'text-amber-500/50'}`}>{p.rate}</div>
                    {p.active && <Badge size="sm" className="text-[9px]">ACTIVE</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><CardTitle>Your Earnings</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Mining Power" value={`×${totalMiningPower.toFixed(1)}`} sub={`${state.peons.filter(p => p.assignedMineId).length} peons mining`} />
              <StatBox label="Daily Earning" value={`~${dailyEarning.toFixed(0)}`} sub="$GOLD/day estimate" />
              <StatBox label="Total Earned" value={state.gold.toFixed(0)} sub="$GOLD lifetime" />
              <StatBox label="Network APY" value="~420%" sub="Variable rate" color="text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'
import { createContext, useContext, useCallback, type ReactNode } from 'react'

type SoundName =
  | 'pack_open'
  | 'pack_shake'
  | 'card_flip'
  | 'common_reveal'
  | 'uncommon_reveal'
  | 'rare_reveal'
  | 'epic_reveal'
  | 'legendary_reveal'
  | 'mythic_reveal'
  | 'gold_claim'
  | 'gold_tick'
  | 'mine_purchase'
  | 'peon_assign'
  | 'button_click'
  | 'ui_hover'

interface SoundContextType {
  play: (name: SoundName) => void
  setVolume: (v: number) => void
  muted: boolean
  toggleMute: () => void
}

const SoundContext = createContext<SoundContextType>({
  play: () => {},
  setVolume: () => {},
  muted: false,
  toggleMute: () => {},
})

export function SoundProvider({ children }: { children: ReactNode }) {
  const play = useCallback((name: SoundName) => {
    // Sound hooks ready - add audio files later
    // console.log(`[Sound] ${name}`)
  }, [])

  const setVolume = useCallback((_v: number) => {}, [])
  const toggleMute = useCallback(() => {}, [])

  return (
    <SoundContext.Provider value={{ play, setVolume, muted: false, toggleMute }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}

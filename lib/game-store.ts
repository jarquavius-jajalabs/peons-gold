'use client'

import type { Mine, PlayerState, Peon } from './mock-data'
import { fetchState, claimGoldApi, buyMineApi, openPackApi, assignPeonApi } from './api-client'
import type { SignMessage } from './api-client'

// Local cache of state (updated after each API call)
let cachedState: PlayerState | null = null

export function getCachedState(): PlayerState | null {
  return cachedState
}

export function setCachedState(state: PlayerState) {
  cachedState = state
}

export async function getState(wallet: string): Promise<PlayerState> {
  const state = await fetchState(wallet)
  cachedState = state
  return state
}

export async function claimGold(wallet: string, signMessage: SignMessage): Promise<number> {
  const { state, claimed } = await claimGoldApi(wallet, signMessage)
  cachedState = state
  return claimed
}

export async function buyMine(wallet: string, txSignature: string): Promise<Mine | null> {
  try {
    const { state, mine } = await buyMineApi(wallet, txSignature)
    cachedState = state
    return mine
  } catch {
    return null
  }
}

export async function openPack(wallet: string, signMessage: SignMessage): Promise<Peon[]> {
  const { state, newPeons } = await openPackApi(wallet, signMessage)
  cachedState = state
  return newPeons
}

export async function assignPeon(wallet: string, peonId: string, mineId: string, shaft: number, signMessage: SignMessage): Promise<boolean> {
  try {
    const { state } = await assignPeonApi(wallet, peonId, mineId, shaft, signMessage)
    cachedState = state
    return true
  } catch {
    return false
  }
}

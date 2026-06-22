import type { PlayerState, Peon, Mine } from './mock-data'
import bs58 from 'bs58'
import { createAuthMessage, type GameAction } from './auth-message'

const API_BASE = '/api'
export type SignMessage = (message: Uint8Array) => Promise<Uint8Array>

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((err as any).error || 'Request failed')
  }
  return res.json()
}

export async function fetchState(wallet: string): Promise<PlayerState> {
  return apiFetch<PlayerState>(`/state?wallet=${encodeURIComponent(wallet)}`)
}

async function createSignedAuth(wallet: string, action: GameAction, signMessage: SignMessage, payload = '') {
  const nonce = Date.now()
  const message = new TextEncoder().encode(createAuthMessage(action, wallet, nonce, payload))
  const signature = await signMessage(message)
  return { nonce, signature: bs58.encode(signature) }
}

export async function claimGoldApi(wallet: string, signMessage: SignMessage): Promise<{ state: PlayerState; claimed: number }> {
  return apiFetch('/claim', {
    method: 'POST',
    body: JSON.stringify({ wallet, auth: await createSignedAuth(wallet, 'claim', signMessage) }),
  })
}

export async function buyMineApi(wallet: string, txSignature: string): Promise<{ state: PlayerState; mine: Mine }> {
  return apiFetch('/buy-mine', {
    method: 'POST',
    body: JSON.stringify({ wallet, txSignature }),
  })
}

export async function openPackApi(wallet: string, signMessage: SignMessage): Promise<{ state: PlayerState; newPeons: Peon[] }> {
  return apiFetch('/open-pack', {
    method: 'POST',
    body: JSON.stringify({ wallet, auth: await createSignedAuth(wallet, 'open-pack', signMessage) }),
  })
}

export async function assignPeonApi(wallet: string, peonId: string, mineId: string, shaft: number, signMessage: SignMessage): Promise<{ state: PlayerState }> {
  const authPayload = `${peonId}:${mineId}:${shaft}`
  return apiFetch('/assign-peon', {
    method: 'POST',
    body: JSON.stringify({ wallet, peonId, mineId, shaft, auth: await createSignedAuth(wallet, 'assign-peon', signMessage, authPayload) }),
  })
}

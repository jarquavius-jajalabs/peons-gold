import type { PlayerState, Peon, Mine } from './mock-data'

const API_BASE = '/api'

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

export async function saveState(wallet: string, state: PlayerState): Promise<PlayerState> {
  return apiFetch<PlayerState>('/state', {
    method: 'PUT',
    body: JSON.stringify({ wallet, state }),
  })
}

export async function claimGoldApi(wallet: string): Promise<{ state: PlayerState; claimed: number }> {
  return apiFetch('/claim', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  })
}

export async function buyMineApi(wallet: string, txSignature: string): Promise<{ state: PlayerState; mine: Mine }> {
  return apiFetch('/buy-mine', {
    method: 'POST',
    body: JSON.stringify({ wallet, txSignature }),
  })
}

export async function openPackApi(wallet: string): Promise<{ state: PlayerState; newPeons: Peon[] }> {
  return apiFetch('/open-pack', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  })
}

export async function assignPeonApi(wallet: string, peonId: string, mineId: string, shaft: number): Promise<{ state: PlayerState }> {
  return apiFetch('/assign-peon', {
    method: 'POST',
    body: JSON.stringify({ wallet, peonId, mineId, shaft }),
  })
}
